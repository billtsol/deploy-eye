# Deploy Eye 👁️

A unified dashboard to monitor your Railway and Vercel deployments in one place.

## Features

- ✅ View Railway and Vercel deployments side-by-side
- ✅ Real-time status indicators (success, building, failed)
- ✅ Deployment timestamps and relative time
- ✅ Click Vercel deployments to open in browser
- ✅ Clean, dark mode UI

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Tokens

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Add your API tokens:

**Railway Token:**
1. Go to https://railway.app/account/tokens
2. Click "Create Token"
3. Copy and paste into `.env.local`

**Vercel Token:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Select "Full Account" scope
4. Copy and paste into `.env.local`

Your `.env.local` should look like:
```
RAILWAY_TOKEN=your_railway_token
VERCEL_TOKEN=your_vercel_token
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your dashboard.

## Deploy to Vercel

The easiest way to deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Don't forget to add your environment variables in Vercel dashboard:
- Settings → Environment Variables
- Add `RAILWAY_TOKEN` and `VERCEL_TOKEN`

## How It Works

- **Server Components**: Fetches deployment data server-side (no CORS issues)
- **Railway GraphQL API**: Queries projects, services, and deployments
- **Vercel REST API**: Gets latest deployments
- **Auto-refresh**: Reload page to see latest deployments

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Railway GraphQL API
- Vercel REST API
