#!/bin/bash

set -Eeuxo pipefail

fetch_live() {
  echo "LIVE START $(date)"

  /usr/bin/docker run \
    --init \
    --rm \
    -e NODE_ENV=production \
    -e WIND_OUTPUT_DIR=/wind/dist \
    -e WIND_LOG_FILE=/wind/live_history.jsonl \
    --name wind_live \
    -v "/root/wind/dist:/wind/dist" \
    -v "/root/wind/live_history.jsonl:/wind/live_history.jsonl" \
    wind node fetch/fetch-live.mjs

  echo "LIVE END $(date)"
}

fetch_live 2>&1 | tee -a /root/wind/live.log
