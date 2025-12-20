#!/bin/bash

set -Eeuxo pipefail

fetch_live() {
  echo "LIVE START $(date)"

  /usr/bin/docker run \
    --init \
    --rm \
    -e NODE_ENV=production \
    -e WIND_OUTPUT_DIR=/wind/dist \
    --name wind_live \
    -v "/root/wind/dist:/wind/dist" \
    wind node fetch/fetch-live.mjs

  echo "LIVE END $(date)"
}

fetch_live 2>&1 | tee -a /root/wind/live.log
