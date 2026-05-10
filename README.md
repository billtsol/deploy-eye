# Deploy Eye

Mobile-first dashboard for the latest production deployments across Railway and Vercel.

## Features

- Multiple `DEPLOY_EYE_TOKEN_RAILWAY` and `DEPLOY_EYE_TOKEN_VERCEL` values in one env var.
- Separate sections per provider account/token.
- Only the latest production deployment per project/service is shown.
- Generated URL and custom domains are displayed when available.
- Deployment detail page with simple health facts and Railway CPU/memory samples.
- Dark and light theme toggle.

## Token setup

Create `.env.local` or `.env`:

```bash
DEPLOY_EYE_TOKEN_RAILWAY=DEPLOY_EYE_TOKEN_RAILWAY_1,DEPLOY_EYE_TOKEN_RAILWAY_2
DEPLOY_EYE_TOKEN_VERCEL=DEPLOY_EYE_TOKEN_VERCEL_1,DEPLOY_EYE_TOKEN_VERCEL_2
```

You can separate tokens with commas, semicolons, spaces, or new lines.

Railway project tokens are also supported through the Railway `Project-Access-Token` header fallback.

## Run

```bash
bun install
bun run dev
```

Open `http://localhost:3000`.

## Build

```bash
bun run lint
bun run build
```
