#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ] || [ "${2:-}" = "" ]; then
  echo "Usage: $0 /path/to/migration-bundle https://target-domain-or-local-url" >&2
  exit 1
fi

BUNDLE_DIR="$1"
TARGET_URL="$2"
PROJECT_DIR="${3:-$(pwd)}"

if [ ! -d "$BUNDLE_DIR" ]; then
  echo "Bundle directory not found: $BUNDLE_DIR" >&2
  exit 1
fi

if [ ! -f "$BUNDLE_DIR/db.sql.gz" ]; then
  echo "Missing $BUNDLE_DIR/db.sql.gz" >&2
  exit 1
fi

if [ ! -f "$BUNDLE_DIR/uploads.tar.gz" ]; then
  echo "Missing $BUNDLE_DIR/uploads.tar.gz" >&2
  exit 1
fi

cd "$PROJECT_DIR"

echo "Starting containers..."
docker compose up -d

echo "Waiting for MySQL..."
for _ in $(seq 1 60); do
  if docker exec wp_mysql mysqladmin ping -h 127.0.0.1 -u"${MYSQL_USER:-wordpress}" -p"${MYSQL_PASSWORD:-wordpress}" --silent >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "Restoring database..."
gunzip -c "$BUNDLE_DIR/db.sql.gz" | docker exec -i wp_mysql mysql -u"${MYSQL_USER:-wordpress}" -p"${MYSQL_PASSWORD:-wordpress}" "${MYSQL_DATABASE:-wordpress}"

echo "Restoring uploads..."
mkdir -p "$PROJECT_DIR/wordpress_site"
tar -xzf "$BUNDLE_DIR/uploads.tar.gz" -C "$PROJECT_DIR/wordpress_site"

echo "Updating site URLs..."
docker exec wp_mysql mysql -u"${MYSQL_USER:-wordpress}" -p"${MYSQL_PASSWORD:-wordpress}" "${MYSQL_DATABASE:-wordpress}" <<SQL
UPDATE wp_options SET option_value = '${TARGET_URL}' WHERE option_name IN ('siteurl', 'home');
SQL

echo "Done. Target URL: $TARGET_URL"

