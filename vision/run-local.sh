#!/usr/bin/env bash

set -eEuxo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd -P)
cd "$script_dir"

docker build --tag vision .

docker run --rm -it \
  -e VISION_DEBUG=true \
  -e VISION_OUTPUT_FILE=/out/kitecount.json \
  -v "$PWD/vision.py:/vision/vision.py" \
  -v "$PWD/kitecount.json:/out/kitecount.json" \
  -v "$PWD/vision_debug:/vision/vision_debug" \
  vision
