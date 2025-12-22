#!/usr/bin/env bash

set -Eeuxo pipefail

export VITE_WIND_VERSION="$(date -u '+%Y%m%d_%H%M')"
export VITE_WIND_ENDPOINT="https://jimwind.com"

npm run build:ce
rm -f dist/*.json
rm -f dist/*.html

rsync -av dist/* --exclude 'frames' wind:wind/dist/

#rsync -av deploy/nginx.conf wind:wind/
#ssh wind systemctl restart wind-nginx

ssh wind 'ln -sf "$(basename $(ls -t /root/wind/dist/assets/main-ce-*.js | head -n1))" /root/wind/dist/assets/latest.js'
