import type { Organization, Contact } from "@shared/schema";

const APOLLO_API_KEY = import.meta.env.VITE_APOLLO_API_KEY || "0ZYbcwNOALNwPx3myATzhQ";

export interface EnrichmentResponse {
  organizations: Organization[];
}

export interface ContactsResponse {
  contacts: Contact[];
}

export async function enrichOrganizations(domains: string[], searchType: "single" | "bulk"): Promise<EnrichmentResponse> {
  const response = await fetch("/api/organizations/enrich", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domains, searchType }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchOrganizationContacts(organizationId: string): Promise<ContactsResponse> {
  const response = await fetch(`/api/organizations/${organizationId}/contacts`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Direct Apollo API calls (for reference - not used in favor of backend proxy)
export async function fetchSingleOrgDirect(domain: string): Promise<any> {
  const response = await fetch(`https://api.apollo.io/v1/organizations/enrich?domain=${domain}`, {
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

  return response.json();
}

export async function fetchBulkOrgsDirect(domains: string[]): Promise<any> {
  const queryParams = domains.map(d => `domains[]=${encodeURIComponent(d)}`).join('&');
  
  const response = await fetch(`https://api.apollo.io/v1/organizations/bulk_enrich?${queryParams}`, {
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

  return response.json();
}
