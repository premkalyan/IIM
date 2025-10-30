# Vercel Deployment Guide

## Files Added for Vercel Deployment

1. **vercel.json** - Vercel configuration file
2. **api/index.ts** - Vercel serverless function handler
3. **.vercelignore** - Files to exclude from deployment

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI globally:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project directory:
```bash
cd /Users/premkalyan/code/BluTic/IIM
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

## Environment Variables

If you have environment variables, add them in Vercel:

1. Go to Project Settings → Environment Variables
2. Add your variables (e.g., `PING_MESSAGE`)

## How It Works

- **Frontend**: Built with `pnpm build:client` and served from `dist/spa`
- **API Routes**: Handled by the serverless function at `/api/index.ts`
- **Routing**: 
  - `/api/*` routes to the serverless function
  - All other routes fall back to `index.html` (SPA routing)

## Testing Locally

1. Build the project:
```bash
pnpm build:client
```

2. Test with Vercel CLI:
```bash
vercel dev
```

## API Endpoints Available

- `GET /api/ping` - Returns a ping message
- `GET /api/demo` - Demo endpoint

## Troubleshooting

### 404 Error
- Make sure `vercel.json` is in the root directory
- Verify the `outputDirectory` is set to `dist/spa`
- Check that the build command runs successfully

### API Routes Not Working
- Ensure `/api/index.ts` is present
- Check that `@vercel/node` is installed as a devDependency
- Verify environment variables are set in Vercel dashboard

### Build Fails
- Run `pnpm build:client` locally to test
- Check build logs in Vercel dashboard
- Ensure all dependencies are listed in `package.json`

