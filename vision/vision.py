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
CONF_THRESHOLD = 0
DEBUG = os.environ.get('VISION_DEBUG', 'false').lower() == 'true'
LOG_FILE = os.environ.get('VISION_LOG_FILE', 'vision_log.txt')
OUTPUT_FILE = os.environ.get('VISION_OUTPUT_FILE', '../public/kitecount.json')
LAST_FRAME_DIR = os.environ.get('VISION_LAST_FRAME_DIR', '../public/frames')
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

def count_kites(url, extra_args=[], slug=None, mask_regions=[]):
    CLS_KITE = 33

    if os.path.exists("/tmp/frame.jpg"):
        os.remove("/tmp/frame.jpg")

    ffmpeg_cmd = ["ffmpeg", "-i", url, "-ss", "2", *extra_args, "-frames:v", "1", "/tmp/frame.jpg"]
    print("Running ffmpeg command:", " ".join(ffmpeg_cmd))
    result = subprocess.run(
        ffmpeg_cmd,
        capture_output=True,
        text=True,
        check=False
    )
    if result.returncode != 0:
        print("ffmpeg exited with code", result.returncode)
        print("stdout:", result.stdout)
        print("stderr:", result.stderr)
        raise subprocess.CalledProcessError(result.returncode, result.args, output=result.stdout, stderr=result.stderr)

    # Load the original frame
    original_img = cv2.imread("/tmp/frame.jpg")

    # If mask regions are specified, create a masked copy for YOLO detection
    if mask_regions:
        masked_img = original_img.copy()
        for region in mask_regions:
            x, y, w, h = region["x"], region["y"], region["w"], region["h"]
            cv2.rectangle(masked_img, (x, y), (x + w, y + h), (0, 0, 0), -1)
        masked_img_path = f"/tmp/frame_masked.jpg"
        cv2.imwrite(masked_img_path, masked_img)
        results = model(masked_img_path, classes=[CLS_KITE], imgsz=1024)
    else:
        results = model("/tmp/frame.jpg", classes=[CLS_KITE], imgsz=1024)

    detections = results[0].boxes
    high_conf_boxes = [box for box in detections if box.cls == CLS_KITE and box.conf > CONF_THRESHOLD]
    kite_count = len(high_conf_boxes)

    # Always save the latest frame with boxes (no confidence labels) for each spot
    if slug:
        os.makedirs(LAST_FRAME_DIR, exist_ok=True)
        # Plot only high-confidence boxes on original image (without mask)
        annotated_img = original_img.copy()
        for box in high_conf_boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cv2.rectangle(annotated_img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(annotated_img, "kite", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 2.0, (0, 255, 0), 2)
        cv2.imwrite(f"{LAST_FRAME_DIR}/{slug}.jpg", annotated_img)
        print(f"Saved annotated frame to {LAST_FRAME_DIR}/{slug}.jpg")

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
            "url": "https://high-five.conjure.co.za/hls/media.m3u8",
            "ffmpeg_extra_args": [],
            # Block out windsock that gets mistaken for a kite sometimes
            # Masked for YOLO detection but not shown in saved frame
            "mask_regions": [{"x": 0, "y": 700, "w": 400, "h": 200}],
            "counter": CountBuffer()
        },
        # {
        #   "slug": "langebaan",
        #     "url": "https://s46.ipcamlive.com/streams/2e9boixwf5rksmc4g/stream.m3u8",
        #     "ffmpeg_extra_args": [],
        #     "counter": CountBuffer()
        # },
        # {
        #     "slug": "bigbay",
        #     "url": "https://live-sec.streamworks.video/oceaneye/oceaneye12.stream/chunks.m3u8",
        #     "ffmpeg_extra_args": [],
        #     "counter": CountBuffer()
        # },
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
        is_daytime = 6 <= now.hour <= 21
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
                kite_count, _ = count_kites(
                    get_stream_url(spot["url"]),
                    spot.get("ffmpeg_extra_args", []),
                    spot["slug"],
                    spot.get("mask_regions", [])
                )
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
