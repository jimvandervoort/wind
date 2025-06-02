#!/usr/bin/env bash

set -Eeuxo pipefail

export VITE_WIND_VERSION="$(date -u '+%Y%m%d_%H%M')"
export VITE_WIND_REDIRECT_URL="https://jimwind.com"
export VITE_WIND_GOTRUE_URL="https://jimwind.com"

# Create temporary directory for rendered templates
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

ssh wind mkdir -p wind/dist
ssh wind chmod 777 wind/dist

npm run build
rm -f dist/*.json
rsync -av dist/* wind:wind/dist/

rsync -av deploy/wind-*.sh wind:/bin/
ssh wind 'chmod +x /bin/wind-*.sh'

rsync -av deploy/init-postgres.sh wind:wind/
ssh wind 'chmod +x wind/init-postgres.sh'

# Render service templates using envsubst
set -a
source .secrets
set +a
for service_file in deploy/*.{service,timer}; do
  if [ -f "$service_file" ]; then
    envsubst < "$service_file" > "$TEMP_DIR/$(basename "$service_file")"
  fi
done

# Copy rendered service files
rsync -av "$TEMP_DIR/" wind:/etc/systemd/system/

docker --context wind network create wind_default --driver bridge || true
docker --context wind volume create wind_pg_data || true

docker --context wind build --build-arg "VITE_WIND_VERSION=$VITE_WIND_VERSION" -t wind .
docker --context wind build -t wind_vision ./vision
docker --context wind build -t wind_backend ./backend

rsync -av deploy/*.conf wind:wind/

ssh wind systemctl daemon-reload
ssh wind systemctl enable --now wind-postgres
ssh wind systemctl enable --now wind-gotrue
ssh wind systemctl enable --now wind-nginx
ssh wind systemctl enable --now wind-puppet.timer
ssh wind systemctl enable --now wind-backend

ssh wind systemctl restart wind-backend
ssh wind docker exec -i wind-backend bun migrate.ts
ssh wind systemctl restart wind-vision
ssh wind systemctl start wind-puppet
