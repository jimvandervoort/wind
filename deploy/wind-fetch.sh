#!/bin/bash

set -Eeuxo pipefail

fetch() {
  echo "START $(date)"

  /usr/bin/docker run \
    --init \
    --rm \
    -e NODE_ENV=production \
    --name wind_puppet \
    --cap-add SYS_ADMIN \
    -v "/root/wind/dist:/wind/dist" \
    wind \
    node /wind/puppet.mjs

  curl -fSs 'https://mac-wind.appspot.com/data/15min.json?offset=' | jq -c '[.[0]]' > /tmp/macwind.json
  mv /tmp/macwind.json /root/wind/dist/

  curl -fSs 'https://capekiting.co.za/wp-json/api/v1/get-wind-data/?page_id=9001&timespanhours=6' | jq -c '.wind_data.kiteometer[0]' > /tmp/langewind.json
  mv /tmp/langewind.json /root/wind/dist/

  echo "END $(date)"
}

fetch 2>&1 | tee -a /root/wind/fetch.log
