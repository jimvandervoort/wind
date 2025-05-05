import cv2
import os
import json
import time
import datetime
import subprocess
import sys
import shutil

from ultralytics import YOLO
from yt_dlp import YoutubeDL

COUNT_BUFFER_LEN = 4
FETCH_SLEEP_SECS = 20
DEBUG = os.environ.get('VISION_DEBUG', 'false').lower() == 'true'
LOG_FILE = os.environ.get('VISION_LOG_FILE', 'vision_log.txt')
OUTPUT_FILE = os.environ.get('VISION_OUTPUT_FILE', '../public/kitecount.json')
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

def count_kites(url, extra_args=[]):
    CLS_KITE = 33

    if os.path.exists("/tmp/frame.jpg"):
        os.remove("/tmp/frame.jpg")

    subprocess.run(["ffmpeg", "-i", url, "-ss", "2", *extra_args, "-frames:v", "1", "/tmp/frame.jpg"],
                check=True, capture_output=True)
    results = model("/tmp/frame.jpg", classes=[CLS_KITE], imgsz=1024)
    detections = results[0].boxes
    kite_count = sum(1 for box in detections if box.cls == CLS_KITE)

    if kite_count > 0 or DEBUG:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        print(f"Saving debug images for {timestamp}")
        debug_dir = 'vision_debug/'
        os.makedirs(debug_dir, exist_ok=True)
        shutil.copy("/tmp/frame.jpg", f"{debug_dir}input_{timestamp}_{kite_count}.jpg")
        annotated_img = results[0].plot()
        result_path = f"{debug_dir}result_{timestamp}_{kite_count}.jpg"
        cv2.imwrite(result_path, annotated_img)
        return kite_count, result_path

    return kite_count, None


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

def write_output(j):
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(j, f)

def log_output(s):
    print(s)
    with open(LOG_FILE, 'a') as f:
        f.write(f"{datetime.datetime.now()}: {s}\n")

def main():
    # Langebaan cams
    # "https://www.youtube.com/watch?v=Hhc6vesmrNk"
    # "https://s75.ipcamlive.com/streams/4bxjaol4nvopmqhtb/stream.m3u8"
    SPOTS = [
        {
            "slug": "khaya",
            "url": "https://conjure.co.za/blouberg/hls/media.m3u8",
            # Block out windsock that gets mistaken for a kite sometimes
            "ffmpeg_extra_args": ["-vf", "drawbox=x=225:y=1015:w=200:h=100:color=black:t=fill"],
            "counter": CountBuffer()
        },
        {
            "slug": "bigbay",
            "url": "https://live-sec.streamworks.video/oceaneye/oceaneye12.stream/chunks.m3u8",
            "ffmpeg_extra_args": [],
            "counter": CountBuffer()
        },
        # {
        #     "slug": "canos",
        #     "url": "https://flus.spotfav.com:443/canos-de-meca/index.m3u8",
        #     "ffmpeg_extra_args": [],
        #     "counter": CountBuffer()
        # },
        # {
        #     "slug": "lances",
        #     "url": "https://flus.spotfav.com/hurricane-tarifa-spotfav/index.m3u8",
        #     "ffmpeg_extra_args": [],
        #     "counter": CountBuffer()
        # }
    ]

    while True:
        now = datetime.datetime.now()
        # High five webcam is closed at night
        is_daytime = 7 <= now.hour <= 21
        if not is_daytime:
            print("Not daytime, skipping")
            write_output({
                "khaya": None,
                "langebaan": None,
                "bigbay": None
            })
            time.sleep(FETCH_SLEEP_SECS)
            continue

        for spot in SPOTS:
            count = 0
            try:
                kite_count, _ = count_kites(get_stream_url(spot["url"]), spot["ffmpeg_extra_args"])
                count = kite_count
            except Exception as e:
                print(f"Error counting kites: {e}")

            spot["counter"].observe(count)
            log_output(f"[{spot['slug']}]: {count}")

        avg = {}
        for spot in SPOTS:
            avg[spot["slug"]] = spot["counter"].average()

        write_output(avg)
        log_output(f"[avg]: {json.dumps(avg)}")

        if not LOOP:
            break

        time.sleep(FETCH_SLEEP_SECS)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        count, path = count_kites(sys.argv[1])
        print(f"Counted {count} kites, saved result to: {path}")

    else:
        main()
