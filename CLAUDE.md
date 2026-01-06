# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Deploy Eye** is a unified deployment dashboard that displays Railway and Vercel deployments in one place. Built with Next.js 15, it provides both grid (side-by-side) and list (combined timeline) views of deployments.

## Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open http://localhost:3000 to view the dashboard.

## Environment Setup

Create `.env.local` with:

```bash
# Railway - Use PROJECT token (not workspace token)
# Create at: Project Settings → Tokens
RAILWAY_TOKEN=your_railway_project_token
RAILWAY_PROJECT_ID=optional_project_id

# Vercel - Use account token with "Full Account" scope
# Create at: https://vercel.com/account/tokens
VERCEL_TOKEN=your_vercel_token
```

**Important Railway Note:** Railway's GraphQL API only works with **project tokens**, not workspace/account tokens. Project tokens are created within individual project settings, not at the account level.

## Architecture

### File Structure

```
app/
├── page.tsx                    # Server component - fetches deployment data
├── components/
│   └── DeploymentView.tsx      # Client component - handles UI state & views
lib/
├── railway.ts                  # Railway GraphQL API client
└── vercel.ts                   # Vercel REST API client
```

### Key Concepts

**Server/Client Split:**
- `app/page.tsx` is a server component that fetches data from Railway and Vercel APIs
- `app/components/DeploymentView.tsx` is a client component that handles view toggling and refresh
- This pattern avoids CORS issues and keeps API tokens server-side

**Data Flow:**
1. Server component fetches deployments via `Promise.all()` (parallel)
2. Data is passed to client component as props
3. Client component combines and sorts deployments
4. User can toggle views or refresh (triggers `router.refresh()`)

### Railway Integration

Railway uses GraphQL API at `https://backboard.railway.com/graphql/v2`

**Authentication:** Project tokens only (workspace tokens don't work)

**Query:** Fetches projects → services → deployments (last 5 per service)

**Status values:** SUCCESS, FAILED, BUILDING, CRASHED, DEPLOYING, REMOVED, REMOVING

The query handles both single project (when `RAILWAY_PROJECT_ID` is set) and all projects the token has access to.

### Vercel Integration

Vercel uses REST API at `https://api.vercel.com/v6/deployments?limit=10`

**Authentication:** Bearer token with Full Account scope

**Status values:** BUILDING, ERROR, INITIALIZING, QUEUED, READY, CANCELED

Returns last 10 deployments across all projects.

### View Modes

**Grid View (default):**
- Side-by-side columns for Railway and Vercel
- Grouped by platform
- Original layout

**List View:**
- Combined timeline of all deployments
- Sorted by most recent first (chronological)
- Shows platform badges (Railway "R" / Vercel triangle)
- Click Vercel deployments to open in browser

### Refresh Mechanism

Uses Next.js `router.refresh()` to revalidate server components:
1. User clicks refresh button
2. Client triggers `router.refresh()`
3. Server components re-execute (fetches latest data)
4. New data flows to client component
5. UI updates automatically

Refresh button shows spinning animation via `isRefreshing` state.

### Status Colors

- 🟢 Green: SUCCESS, READY
- 🟡 Yellow (pulsing): BUILDING, DEPLOYING, INITIALIZING, QUEUED
- 🔴 Red: FAILED, ERROR, CRASHED
- ⚪ Gray: Unknown status

## Known Limitations

1. **Railway workspace tokens don't work** - Only project tokens are supported by Railway's GraphQL API
2. **No auto-refresh** - User must click refresh button (could add polling in future)
3. **Limited history** - Shows last 5 Railway deployments per service, last 10 Vercel deployments
4. **No deployment actions** - Read-only dashboard (no redeploy, rollback, etc.)

## Adding Features

**To add a new platform:**
1. Create `lib/platform-name.ts` with API client
2. Add interface for deployment data
3. Update `app/page.tsx` to fetch data
4. Update `DeploymentView.tsx` to handle new platform
5. Add platform badge/icon in UI

**To add deployment actions:**
1. Create server actions in `app/actions/` directory
2. Add mutation queries/API calls
3. Update UI with action buttons
4. Handle loading/error states

## Troubleshooting

**Railway shows "Not Authorized":**
- Verify you're using a **project token** (not workspace token)
- Check token was created in Project Settings → Tokens
- Ensure token has access to the project

**Vercel shows no deployments:**
- Verify token has "Full Account" scope
- Check token at https://vercel.com/account/tokens
- Ensure you have deployments in your account

**Refresh doesn't work:**
- Check browser console for errors
- Verify API tokens are still valid
- Check server logs for API errors
