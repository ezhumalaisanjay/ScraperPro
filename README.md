# Apollo API Organization Enrichment Tool

A professional web application that uses the Apollo API to enrich organization data and fetch contacts with a modern ShadCN UI interface.

## Features

- **Organization Lookup**: Single and bulk domain search
- **Rich Data Display**: Comprehensive organization information including:
  - Company details (name, website, phone, social links)
  - Employee count and founding year
  - Industry and location information
  - Technology stack and tools used
  - Department breakdown
  - Keywords and company description
- **Contact Management**: View key contacts for each organization
- **Data Export**: CSV export functionality
- **Professional UI**: Modern interface with tabbed organization cards

## Tech Stack

- **Frontend**: React with TypeScript, Vite, TailwindCSS, ShadCN UI
- **Backend**: Netlify Functions
- **API**: Apollo.io API integration
- **Deployment**: Netlify

## Deployment to Netlify

### Prerequisites

1. Apollo API key from [Apollo.io](https://apollo.io)
2. Netlify account

### Deployment Steps

1. **Connect Repository to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository

2. **Configure Build Settings**:
   - Build command: `vite build`
   - Publish directory: `dist`
   - Functions directory: `functions`

3. **Set Environment Variables**:
   - Go to Site settings > Environment variables
   - Add: `APOLLO_API_KEY` with your Apollo API key

4. **Deploy**:
   - Click "Deploy site"
   - Your app will be available at `https://your-site-name.netlify.app`

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   ```bash
   netlify deploy --prod --dir=dist
   ```

## Environment Variables

- `APOLLO_API_KEY`: Your Apollo.io API key (required)

## Usage

1. Enter domain(s) in the search field
2. Choose single or bulk search
3. Click "Enrich Organizations" 
4. Browse detailed organization information in tabbed interface
5. Click "View Contacts" to see key personnel
6. Export results to CSV

## API Endpoints

- `POST /api/organizations/enrich`: Organization enrichment
- `GET /api/organizations/:id/contacts`: Fetch contacts
- `GET /api/health`: Health check

## License

MIT