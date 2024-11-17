#!/usr/bin/env bash

set -Eeuxo pipefail

export VITE_WIND_VERSION="$(date -u '+%Y%m%d_%H%M')"

ssh wind mkdir -p wind/dist
ssh wind chmod 777 wind/dist

npm run build
cp dist/*.png dist/assets
rm -f dist/*.json
scp -r dist/* wind:wind/dist


scp deploy/wind-*.sh wind:/bin/
ssh wind 'chmod +x /bin/wind-*.sh'
scp deploy/*.{service,timer} wind:/etc/systemd/system

docker --context wind build --build-arg "VITE_WIND_VERSION=$VITE_WIND_VERSION" -t wind .

scp deploy/default.conf wind:wind/default.conf

ssh wind systemctl daemon-reload
ssh wind systemctl enable --now wind-nginx
ssh wind systemctl enable --now wind-puppet.timer
ssh wind systemctl enable --now wind-stats.timer
ssh wind systemctl start wind-puppet
