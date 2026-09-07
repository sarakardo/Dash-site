# Dash — Unified Cloudflare Static Site

This repository is configured as a Cloudflare Workers Static Assets site.

- Deploy command: `npx wrangler deploy`
- Static assets directory: `./public`
- Main site: `/`
- Editorial hub: `/chekhabar/`
- CSS: `/style.css`
- Images/SVG: `/assets/`

The `public/` directory is the only directory uploaded as static assets. This prevents deployment/configuration files from being mixed with site content.
