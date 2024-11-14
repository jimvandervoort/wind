#!/bin/bash

set -Eeuxo pipefail

fetch() {
  echo "START $(date)"

  /usr/bin/docker run \
    --init \
    --rm \
    --name wind_puppet \
    --cap-add SYS_ADMIN \
    -v "/root/wind/dist:/wind/dist" \
    wind \
    node /wind/puppet.mjs

  curl -fSs 'https://mac-wind.appspot.com/data/15min.json?offset=' > /tmp/wind.json
  mv /tmp/wind.json /root/wind/dist/

  echo "END $(date)"
}

fetch 2>&1 | tee -a /root/wind/fetch.log
