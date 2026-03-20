#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-$HOME/wp-nazar}"
OUTPUT_ROOT="${2:-$HOME}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BUNDLE_DIR="$OUTPUT_ROOT/seventyseven-migration-$TIMESTAMP"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Project directory not found: $PROJECT_DIR" >&2
  exit 1
fi

mkdir -p "$BUNDLE_DIR"

cd "$PROJECT_DIR"

echo "Creating DB dump..."
sudo docker exec wp_mysql sh -lc \
  "exec mysqldump --no-tablespaces --single-transaction -uwordpress -pwordpress wordpress" \
  | gzip > "$BUNDLE_DIR/db.sql.gz"

echo "Archiving uploads..."
tar -czf "$BUNDLE_DIR/uploads.tar.gz" -C "$PROJECT_DIR/wordpress_site" uploads

echo "Collecting config..."
cp docker-compose.yml "$BUNDLE_DIR/docker-compose.yml"

{
  echo "timestamp=$TIMESTAMP"
  echo "project_dir=$PROJECT_DIR"
  echo "hostname=$(hostname)"
  echo "docker_compose=$(docker compose version 2>/dev/null | head -n 1 || true)"
  echo "wordpress_core=$(sudo docker exec wp_site sh -lc \"sed -n '19p' /var/www/html/wp-includes/version.php\" | sed -E \"s/.*'([^']+)'.*/\\1/\")"
  echo "siteurl=$(sudo docker exec wp_mysql mysql -uwordpress -pwordpress -N -e \"SELECT option_value FROM wordpress.wp_options WHERE option_name='siteurl';\" 2>/dev/null || true)"
  echo "home=$(sudo docker exec wp_mysql mysql -uwordpress -pwordpress -N -e \"SELECT option_value FROM wordpress.wp_options WHERE option_name='home';\" 2>/dev/null || true)"
  echo "containers="
  sudo docker ps --format '  {{.Names}} {{.Image}} {{.Status}}'
} > "$BUNDLE_DIR/site-manifest.txt"

if [ -f /etc/nginx/sites-available/seventysevenworld.com ]; then
  sudo cp /etc/nginx/sites-available/seventysevenworld.com "$BUNDLE_DIR/nginx.conf"
fi

echo "Bundle created at: $BUNDLE_DIR"
ls -lh "$BUNDLE_DIR"

