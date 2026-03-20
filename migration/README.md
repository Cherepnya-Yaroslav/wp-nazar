# Server Migration Kit

This project is not переносится by `git pull` alone. To recreate the current production site you need:

1. Git repository contents
2. Fresh MySQL dump
3. Fresh `wordpress_site/uploads` archive
4. Nginx reverse-proxy config for the domain

## Files in this directory

- `export-from-current-server.sh`
  - Run on the current server
  - Creates a migration bundle with database dump, uploads archive, project metadata, and nginx config if present
- `import-to-new-server.sh`
  - Run on the new server after cloning the repo
  - Restores DB and uploads, then updates `siteurl/home`
- `bootstrap-ubuntu.sh`
  - Optional helper for a fresh Ubuntu/Debian server
  - Installs Docker, Docker Compose plugin, nginx, and certbot
- `nginx/seventysevenworld.com.conf.example`
  - Base nginx config for routing the domain to Docker on `127.0.0.1:8080`

## Recommended migration flow

1. Clone the repo on the new server
2. Copy `.env.example` to `.env` and adjust credentials if needed
3. Run `migration/export-from-current-server.sh` on the current server
4. Copy the generated migration bundle to the new server
5. Run `migration/import-to-new-server.sh /path/to/bundle https://your-domain`
6. Install nginx and use `migration/nginx/seventysevenworld.com.conf.example`
7. Issue Let's Encrypt certificates
8. Switch DNS after final verification

## Contents of a migration bundle

- `db.sql.gz`
- `uploads.tar.gz`
- `docker-compose.yml`
- `site-manifest.txt`
- `nginx.conf` if found on the current server

## Important

- Certificates are not required to migrate. It is usually cleaner to reissue them on the new server.
- DNS cutover should happen only after:
  - homepage works
  - `/wp-admin` works
  - product images load
  - cart and checkout work
  - admin login works
