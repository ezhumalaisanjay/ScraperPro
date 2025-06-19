import { useState } from "react";
import { Building2, Search, Wifi, Download, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import SearchSection from "@/components/search-section";
import OrganizationCard from "@/components/organization-card";
import type { Organization } from "@shared/schema";

export default function Home() {
  const [searchParams, setSearchParams] = useState<{
    domains: string[];
    searchType: "single" | "bulk";
  } | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/organizations/enrich", searchParams],
    queryFn: async () => {
      if (!searchParams) return null;
      
      console.log("Making API request with params:", searchParams);
      
      const response = await fetch("/api/organizations/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("API success response:", result);
      return result;
    },
    enabled: !!searchParams,
  });

  const organizations: Organization[] = data?.organizations || [];

  const handleSearch = (domains: string[], searchType: "single" | "bulk") => {
    setSearchParams({ domains, searchType });
  };

  const handleClear = () => {
    setSearchParams(null);
  };

  const handleExportCSV = () => {
    if (!organizations.length) return;
    
    const csvHeaders = ["Name", "Website", "City", "State", "Industry", "Employees", "Revenue"];
    const csvRows = organizations.map(org => [
      org.name || "",
      org.website_url || "",
      org.city || "",
      org.state || "",
      org.industry || "",
      org.estimated_num_employees?.toString() || "",
      org.annual_revenue?.toString() || "",
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `organizations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Apollo Enrichment Tool</h1>
                <p className="text-sm text-gray-500">Organization data lookup and contact discovery</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <SearchSection onSearch={handleSearch} onClear={handleClear} isLoading={isLoading} />

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span className="text-gray-600">Fetching organization data...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Error occurred</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {error instanceof Error ? error.message : "Failed to fetch organization data. Please check your API key and try again."}
                  </p>
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer">Debug Info</summary>
                    <pre className="text-xs text-red-600 mt-1 p-2 bg-red-100 rounded">
                      {JSON.stringify({
                        error: error instanceof Error ? error.message : String(error),
                        searchParams,
                        timestamp: new Date().toISOString()
                      }, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {organizations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {organizations.length} Organization{organizations.length !== 1 ? 's' : ''} Found
              </h3>
              <div className="flex space-x-2">
                <button 
                  onClick={handleExportCSV}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export CSV
                </button>
              </div>
            </div>

            {organizations.map((org, index) => (
              <OrganizationCard key={org.id || index} organization={org} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {searchParams && !isLoading && !error && organizations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
              <p className="text-gray-500">
                Try searching with different domains or check if the domains are correct.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>API Key secured via environment variables</span>
            </div>
            <div className="text-sm text-gray-500">
              Powered by Apollo.io API
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
