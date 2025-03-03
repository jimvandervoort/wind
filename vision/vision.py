import cv2
import os
import json
import time
import datetime
import subprocess
import sys

from ultralytics import YOLO
from yt_dlp import YoutubeDL

COUNT_BUFFER_LEN = 4
FETCH_SLEEP_SECS = 20
DEBUG = os.environ.get('VISION_DEBUG', 'false').lower() == 'true'
LOG_FILE = os.environ.get('VISION_LOG_FILE', 'vision_log.txt')
OUTPUT_FILE = os.environ.get('VISION_OUTPUT_FILE', 'kitecount.json')
LOOP = os.environ.get('VISION_LOOP', 'false').lower() == 'true'

model = YOLO('yolo11x.pt')

def get_stream_url(url):
    if url.startswith('https://www.youtube.com/'):
        with YoutubeDL() as ydl:
            info = ydl.extract_info(url, download=False)
            url = info['url']
            print(f"Extracted URL: {url}")
            return url

    return url

def count_kites(url):
    CLS_KITE = 33

    subprocess.run(["ffmpeg", "-i", url, "-ss", "2", "-frames:v", "1", "/tmp/frame.jpg"],
                check=True, capture_output=True)
    results = model("/tmp/frame.jpg")
    os.remove("/tmp/frame.jpg")
    detections = results[0].boxes
    print(detections)

    kite_count = sum(1 for box in detections if box.cls == CLS_KITE)

    if not DEBUG:
        return kite_count, None

    annotated_img = results[0].plot()
    debug_dir = 'vision_debug/'
    os.makedirs(debug_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    result_path = f"{debug_dir}result_{timestamp}.jpg"
    cv2.imwrite(result_path, annotated_img)

    return kite_count, result_path


class CountBuffer:
    def __init__(self):
        self.counts = []

    def observe(self, count):
        self.counts.append(count)
        if len(self.counts) > COUNT_BUFFER_LEN:
            self.counts.pop(0)

    def average(self):
        if not self.counts:
            return 0
        return sum(self.counts) / len(self.counts)


def main():
    SPOTS = [
        {
            "slug": "khaya",
            "url": "https://conjure.co.za/blouberg/hls/media.m3u8",
            "counter": CountBuffer()
        },
        # {
        #     "slug": "langebaan",
        #     "counter": KiteCounter("https://www.youtube.com/watch?v=Hhc6vesmrNk")
        #     "counter": KiteCounter("https://s75.ipcamlive.com/streams/4bxjaol4nvopmqhtb/stream.m3u8")
        # },
        {
            "slug": "bigbay",
            "url": "https://live-sec.streamworks.video/oceaneye/oceaneye12.stream/chunks.m3u8",
            "counter": CountBuffer()
        }
    ]

    while True:
        now = datetime.datetime.now()
        # High five webcam is closed at night
        is_daytime = 7 <= now.hour <= 21
        if not is_daytime:
            print("Not daytime, skipping")
            with open(OUTPUT_FILE, 'w') as f:
                json.dump({
                    "khaya": None,
                    "langebaan": None,
                    "bigbay": None
                }, f)
            time.sleep(FETCH_SLEEP_SECS)
            continue

        for spot in SPOTS:
            # Run synchronously
            count = 0
            try:
                kite_count, _ = count_kites(get_stream_url(spot["url"]))
                count = kite_count
            except Exception as e:
                print(f"Error counting kites: {e}")

            spot["counter"].observe(count)
            with open(LOG_FILE, 'a') as f:
                f.write(f"{now}: [{spot['slug']}]: {count}\n")

        avg = {}
        for spot in SPOTS:
            avg[spot["slug"]] = spot["counter"].average()

        print(avg)
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(avg, f)

        if not LOOP:
            break

        time.sleep(FETCH_SLEEP_SECS)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        count, path = count_kites(sys.argv[1])
        print(f"Counted {count} kites, saved result to: {path}")

    else:
        main()
