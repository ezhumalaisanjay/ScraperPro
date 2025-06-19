import { Handler } from '@netlify/functions';
import { z } from 'zod';

// Define schemas directly in the function to avoid import issues
const enrichmentRequestSchema = z.object({
  domains: z.array(z.string()).min(1, "At least one domain is required"),
  searchType: z.enum(["single", "bulk"]),
});

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;

const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '') || '/';

    console.log('Function called:', { path, method: event.httpMethod });

    // Health check endpoint
    if (path === '/health' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          apollo_api_configured: !!APOLLO_API_KEY,
          timestamp: new Date().toISOString(),
          path: event.path
        }),
      };
    }

    // Organization enrichment endpoint
    if (path === '/organizations/enrich' && event.httpMethod === 'POST') {
      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Request body is required' }),
        };
      }

      if (!APOLLO_API_KEY) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ message: 'Apollo API key not configured' }),
        };
      }

      const { domains, searchType } = enrichmentRequestSchema.parse(JSON.parse(event.body));

      if (searchType === "single") {
        const response = await fetch(`https://api.apollo.io/api/v1/organizations/enrich?domain=${encodeURIComponent(domains[0])}`, {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
            "x-api-key": APOLLO_API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`Apollo API error: ${response.status} ${response.statusText}`);
        }

        const apolloResponse = await response.json();
        const organizations = apolloResponse.organization ? [apolloResponse.organization] : [];
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ organizations }),
        };
      } else {
        const queryParams = domains.map(domain => `domains[]=${encodeURIComponent(domain)}`).join('&');

        const response = await fetch(`https://api.apollo.io/api/v1/organizations/bulk_enrich?${queryParams}`, {
          method: "POST",
          headers: {
            "accept": "application/json",
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
            "x-api-key": APOLLO_API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`Apollo API error: ${response.status} ${response.statusText}`);
        }

        const apolloResponse = await response.json();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ organizations: apolloResponse.organizations || [] }),
        };
      }
    }

    // Contacts endpoint
    if (path.match(/^\/organizations\/[^\/]+\/contacts$/) && event.httpMethod === 'GET') {
      const orgId = path.split('/')[2];

      if (!APOLLO_API_KEY) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ contacts: [] }),
        };
      }

      const response = await fetch(`https://api.apollo.io/api/v1/mixed_people/search`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          "x-api-key": APOLLO_API_KEY,
        },
        body: JSON.stringify({
          organization_ids: [orgId],
          page: 1,
          per_page: 10
        })
      });

      if (!response.ok) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ contacts: [] }),
        };
      }

      const apolloResponse = await response.json();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ contacts: apolloResponse.people || [] }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        message: 'Not found',
        path: path,
        availableEndpoints: ['/health', '/organizations/enrich', '/organizations/:id/contacts']
      }),
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: error instanceof Error ? error.message : 'Internal server error',
        error: 'API_ERROR'
      }),
    };
  }
};

export { handler };