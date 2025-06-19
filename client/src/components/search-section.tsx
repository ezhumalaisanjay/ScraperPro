import { useState } from "react";
import { Search, Globe, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SearchSectionProps {
  onSearch: (domains: string[], searchType: "single" | "bulk") => void;
  onClear: () => void;
  isLoading: boolean;
}

export default function SearchSection({ onSearch, onClear, isLoading }: SearchSectionProps) {
  const [domains, setDomains] = useState("");
  const [searchType, setSearchType] = useState<"single" | "bulk">("single");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domains.trim()) return;
    
    const domainList = domains.split(",").map(d => d.trim()).filter(Boolean);
    if (domainList.length === 0) return;
    
    onSearch(domainList, searchType);
  };

  const handleClear = () => {
    setDomains("");
    onClear();
  };

  const placeholder = searchType === "single" 
    ? "Enter domain - e.g., google.com"
    : "Enter multiple domains separated by commas - e.g., google.com,amazon.com,microsoft.com";

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Search className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Organization Lookup</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Type Toggle */}
          <RadioGroup value={searchType} onValueChange={(value) => setSearchType(value as "single" | "bulk")}>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="text-sm font-medium text-gray-700">
                  Single Organization
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bulk" id="bulk" />
                <Label htmlFor="bulk" className="text-sm font-medium text-gray-700">
                  Bulk Enrichment
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Search Input */}
          <div className="relative">
            <Input
              type="text"
              placeholder={placeholder}
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              className="pr-10"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Globe className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button type="submit" disabled={isLoading || !domains.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Enrich Organizations
            </Button>
            <Button type="button" variant="outline" onClick={handleClear}>
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
