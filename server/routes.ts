import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { enrichmentRequestSchema, organizationSchema, contactSchema } from "@shared/schema";
import { z } from "zod";

const APOLLO_API_KEY = process.env.APOLLO_API_KEY || process.env.NEXT_PUBLIC_APOLLO_API_KEY || "0ZYbcwNOALNwPx3myATzhQ";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apollo API proxy endpoints
  app.post("/api/organizations/enrich", async (req, res) => {
    try {
      const { domains, searchType } = enrichmentRequestSchema.parse(req.body);
      
      let apolloResponse;
      
      if (searchType === "single") {
        // Single organization enrichment
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
        
        apolloResponse = await response.json();
        
        // Wrap single organization in array for consistent response format
        const organizations = apolloResponse.organization ? [apolloResponse.organization] : [];
        res.json({ organizations });
      } else {
        // Bulk organization enrichment
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
        
        apolloResponse = await response.json();
        res.json({ organizations: apolloResponse.organizations || [] });
      }
    } catch (error) {
      console.error("Organization enrichment error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to enrich organizations",
        error: "ENRICHMENT_ERROR"
      });
    }
  });

  // Fetch contacts for an organization
  app.get("/api/organizations/:orgId/contacts", async (req, res) => {
    try {
      const { orgId } = req.params;
      
      // Use the people search API with organization filter
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
        // If people search fails, return empty contacts instead of error
        console.warn(`People search failed for org ${orgId}: ${response.status} ${response.statusText}`);
        res.json({ contacts: [] });
        return;
      }
      
      const apolloResponse = await response.json();
      res.json({ contacts: apolloResponse.people || [] });
    } catch (error) {
      console.error("Contacts fetch error:", error);
      // Return empty contacts instead of error to avoid breaking the UI
      res.json({ contacts: [] });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      apollo_api_configured: !!APOLLO_API_KEY,
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
