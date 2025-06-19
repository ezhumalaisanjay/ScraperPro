import { useState } from "react";
import { Building, MapPin, Users, Tag, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Organization, Contact } from "@shared/schema";

interface OrganizationCardProps {
  organization: Organization;
}

export default function OrganizationCard({ organization }: OrganizationCardProps) {
  const [showContacts, setShowContacts] = useState(false);

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/organizations", organization.id, "contacts"],
    queryFn: async () => {
      const response = await fetch(`/api/organizations/${organization.id}/contacts`);
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      return response.json();
    },
    enabled: showContacts && !!organization.id,
  });

  const contacts: Contact[] = contactsData?.contacts || [];

  const handleToggleContacts = () => {
    setShowContacts(!showContacts);
  };

  const formatEmployeeCount = (count?: number) => {
    if (!count) return "Unknown";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M+ employees`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K+ employees`;
    return `${count}+ employees`;
  };

  const getCompanyInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGradientColor = (name: string) => {
    const colors = [
      "from-blue-500 to-purple-600",
      "from-orange-500 to-red-600", 
      "from-green-500 to-blue-600",
      "from-purple-500 to-pink-600",
      "from-yellow-500 to-orange-600",
      "from-indigo-500 to-purple-600"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 bg-gradient-to-br ${getGradientColor(organization.name)} rounded-lg flex items-center justify-center`}>
              <span className="text-white font-medium text-sm">
                {getCompanyInitials(organization.name)}
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{organization.name}</h4>
                {organization.website_url && (
                  <p className="text-sm text-gray-500 mt-1">{organization.website_url}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleToggleContacts}>
                  <Users className="w-3 h-3 mr-1" />
                  {showContacts ? "Hide Contacts" : "View Contacts"}
                  {showContacts ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                </Button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(organization.city || organization.state) && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{[organization.city, organization.state].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {organization.estimated_num_employees && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{formatEmployeeCount(organization.estimated_num_employees)}</span>
                </div>
              )}
              {organization.industry && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span>{organization.industry}</span>
                </div>
              )}
            </div>

            {(organization.keywords || organization.technologies) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {organization.keywords?.slice(0, 3).map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
                {organization.technologies?.slice(0, 3).map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expandable Contacts Section */}
        {showContacts && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-sm font-semibold text-gray-900">Key Contacts</h5>
              {contactsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
                  <span className="text-xs text-gray-500">Loading...</span>
                </div>
              ) : (
                <span className="text-xs text-gray-500">
                  {contacts.length} contact{contacts.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>
            
            {contactsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.slice(0, 5).map((contact, index) => (
                  <div key={contact.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {getCompanyInitials(contact.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      {contact.title && (
                        <p className="text-xs text-gray-500">{contact.title}</p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      {contact.email && (
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Mail className="w-3 h-3" />
                        </button>
                      )}
                      {contact.phone && (
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Phone className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {contacts.length > 5 && (
                  <button className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all {contacts.length} contacts →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No contacts found for this organization</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
