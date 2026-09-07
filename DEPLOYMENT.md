# Deployment

1. Replace the contents of `sarakardo/Dash-site` on `main` with this repository.
2. Keep `wrangler.jsonc` at the repository root.
3. Cloudflare Workers Builds should use:
   - Root directory: `/`
   - Build command: none
   - Deploy command: `npx wrangler deploy`
   - Production branch: `main`
4. Commit/push the replacement.

The Wrangler configuration serves only `./public` as static assets. The `chekhabar/` directory, CSS and `assets/` are therefore deployed together as one static asset collection.
