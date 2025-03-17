#!/bin/bash

set -Eeuxo pipefail

fetch() {
  echo "START $(date)"

  /usr/bin/docker run \
    --init \
    --rm \
    -e NODE_ENV=production \
    -e WIND_OUTPUT_DIR=/wind/dist \
    --name wind_fetch \
    --cap-add SYS_ADMIN \
    -v "/root/wind/dist:/wind/dist" \
    wind

  echo "END $(date)"
}

fetch 2>&1 | tee -a /root/wind/fetch.log
