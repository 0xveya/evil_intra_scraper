#!/bin/sh
set -eu

remote_host="vps"
remote_dir="/opt/evil-intra-scraper"

scp compose.vps.yaml "$remote_host:$remote_dir/compose.yaml"
ssh "$remote_host" "cd '$remote_dir' && docker compose pull && docker compose up -d --force-recreate --remove-orphans && docker image prune -f"
