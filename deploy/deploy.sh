#!/usr/bin/env bash

set -Eeuxo pipefail

ssh wind mkdir -p wind/dist
ssh wind chmod 777 wind/dist

npm run build
rm -f dist/*.json
scp -r dist/* wind:wind/dist


scp deploy/wind-fetch.sh wind:/bin/wind-fetch.sh
ssh wind chmod +x /bin/wind-fetch.sh
scp deploy/*.{service,timer} wind:/etc/systemd/system

docker --context wind build -t wind .

ssh wind systemctl daemon-reload
ssh wind systemctl enable --now wind-nginx
ssh wind systemctl enable --now wind-puppet.timer
ssh wind systemctl start wind-puppet
