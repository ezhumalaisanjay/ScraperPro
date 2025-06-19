# Netlify Deployment Guide

## Quick Deploy Steps

1. **Push to GitHub/GitLab**:
   ```bash
   git add .
   git commit -m "Apollo enrichment tool ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose your repository
   - Use these settings:
     - Build command: `vite build`
     - Publish directory: `dist`
     - Functions directory: `functions`

3. **Add Environment Variable**:
   - In Netlify dashboard: Site settings → Environment variables
   - Add variable: `APOLLO_API_KEY` = your Apollo API key

4. **Deploy**:
   - Click "Deploy site"
   - Wait for build to complete

## Testing Your Deployed Site

1. Visit your Netlify URL
2. Test health endpoint: `https://your-site.netlify.app/api/health`
3. Search for organizations using the interface

## Troubleshooting

- If you get 404 errors, check that functions are properly deployed
- Verify environment variables are set in Netlify dashboard
- Check function logs in Netlify dashboard

Your comprehensive Apollo enrichment tool will be live with:
- Organization search and enrichment
- Detailed tabbed interface with all Apollo data
- Technology stacks, department breakdowns
- Contact viewing capabilities
- CSV export functionality