# Deploy Eye

Mobile-first dashboard for the latest production deployments across Railway and Vercel.

## Features

- Multiple `RAILWAY_TOKEN` and `VERCEL_TOKEN` values in one env var.
- Separate sections per provider account/token.
- Only the latest production deployment per project/service is shown.
- Generated URL and custom domains are displayed when available.
- Deployment detail page with simple health facts and Railway CPU/memory samples.
- Dark and light theme toggle.

## Token setup

Create `.env.local` or `.env`:

```bash
RAILWAY_TOKEN=railway_token_1,railway_token_2
VERCEL_TOKEN=vercel_token_1,vercel_token_2
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
