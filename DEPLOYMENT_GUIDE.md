# Netlify Deployment Guide

## Environment Variables Setup

Your Apollo API web scraping application is ready to deploy, but you need to configure the Apollo API key on Netlify:

### Step 1: Configure Environment Variables on Netlify
1. Go to your Netlify dashboard: https://app.netlify.com/
2. Select your `webscaraping` site
3. Go to **Site Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Key**: `APOLLO_API_KEY`
   - **Value**: Your Apollo API key (starts with your provided key)
   - **Scopes**: Check both "Builds" and "Functions"

### Step 2: Redeploy Your Site
After adding the environment variable:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the deployment to complete

### Step 3: Test Your Deployment
Once deployed, your site at `https://webscaraping.netlify.app/` should work with:
- Organization search by domain
- Comprehensive organization data display
- CSV export functionality
- Contact information (if available)

## API Endpoints Available
- `/api/organizations/enrich` - Organization enrichment
- `/api/organizations/:id/contacts` - Contact data
- `/api/health` - Health check

## Troubleshooting
If you still get API errors:
1. Verify the Apollo API key is correctly set in Netlify environment variables
2. Check the Netlify function logs in your dashboard
3. Ensure your Apollo API key has proper permissions for organization enrichment

Your application is fully built and ready - it just needs the API key configured on Netlify to work in production.