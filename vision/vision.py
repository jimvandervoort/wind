import cv2
import os
import json
import time
import datetime
import subprocess
import sys

from ultralytics import YOLO
from yt_dlp import YoutubeDL

COUNT_BUFFER = 3
FETCH_SLEEP_SECS = 10
VISION_DEBUG = os.environ.get('VISION_DEBUG', 'false').lower() == 'true'
LOG_FILE = os.environ.get('VISION_LOG_FILE', 'detection_log.txt')
OUTPUT_FILE = os.environ.get('VISION_OUTPUT_FILE', 'kitecount.json')
VISION_LOOP = os.environ.get('VISION_LOOP', 'false').lower() == 'true'

model = YOLO('yolo11x.pt')

def get_stream_url(url):
    if url.startswith('https://www.youtube.com/'):
        with YoutubeDL() as ydl:
            info = ydl.extract_info(url, download=False)
            url = info['url']
            print(f"Extracted URL: {url}")
            return url

    return url

def count_kites(image_path):
    results = model(image_path)
    detections = results[0].boxes
    print(detections)
    kite_count = sum(1 for box in detections if box.cls == 33)

    if not VISION_DEBUG:
        return kite_count, None

    annotated_img = results[0].plot()
    debug_dir = 'vision_debug/'
    os.makedirs(debug_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    result_path = f"{debug_dir}result_{timestamp}.jpg"
    cv2.imwrite(result_path, annotated_img)

    return kite_count, result_path


class KiteCounter:
    def __init__(self, url):
        self.recent_counts = []
        self.url = get_stream_url(url)

    def observe(self, count):
        self.recent_counts.append(count)
        if len(self.recent_counts) > COUNT_BUFFER:
            self.recent_counts.pop(0)

    def average(self):
        if not self.recent_counts:
            return 0
        return sum(self.recent_counts) / len(self.recent_counts)

    def count_kites(self):
        subprocess.run(["ffmpeg", "-i", self.url, "-ss", "2", "-frames:v", "1", "/tmp/frame.jpg"],
                      check=True, capture_output=True)

        kite_count, _ = count_kites("/tmp/frame.jpg")
        with open(LOG_FILE, "a") as f:
            f.write(f"{datetime.datetime.now()}: [{self.url}] detected {kite_count} kites\n")

        if os.path.exists("/tmp/frame.jpg"):
            os.remove("/tmp/frame.jpg")

        return kite_count

    async def run(self):
        count = 0

        try:
            count = await self.count_kites()
        except Exception as e:
            print(f"Failed to count kites: {e}")

        self.observe(count)


def main():
    SPOTS = [
        {
            "slug": "khaya",
            "counter": KiteCounter("https://conjure.co.za/blouberg/hls/media.m3u8")
        },
        {
            "slug": "langebaan",
            "counter": KiteCounter("https://www.youtube.com/watch?v=Hhc6vesmrNk")
        },
        {
            "slug": "bigbay",
            "counter": KiteCounter("https://live-sec.streamworks.video/oceaneye/oceaneye12.stream/chunks.m3u8")
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
                subprocess.run(["ffmpeg", "-i", spot["counter"].url, "-ss", "2", "-frames:v", "1", "/tmp/frame.jpg"],
                              check=True, capture_output=True)
                kite_count, _ = count_kites("/tmp/frame.jpg")
                if os.path.exists("/tmp/frame.jpg"):
                    os.remove("/tmp/frame.jpg")
                count = kite_count
            except Exception as e:
                print(f"Failed to count kites: {e}")

            spot["counter"].observe(count)

        avg = {}
        for spot in SPOTS:
            avg[spot["slug"]] = spot["counter"].average()

        print(avg)
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(avg, f)

        if VISION_LOOP != 'true':
            break

        time.sleep(FETCH_SLEEP_SECS)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        count, path = count_kites(sys.argv[1])
        print(f"Counted {count} kites, saved result to: {path}")

    else:
        main()
