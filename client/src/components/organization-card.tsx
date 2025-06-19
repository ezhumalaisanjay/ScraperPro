import { useState } from "react";
import { Building, MapPin, Users, Tag, Mail, Phone, ChevronDown, ChevronUp, ExternalLink, Calendar, DollarSign, Globe, Linkedin, Twitter, Facebook, Briefcase, Code, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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

  const getDepartmentData = () => {
    if (!organization.departmental_head_count) return [];
    return Object.entries(organization.departmental_head_count)
      .filter(([_, count]) => count > 0)
      .map(([dept, count]) => ({ 
        name: dept.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
        count 
      }))
      .sort((a, b) => b.count - a.count);
  };

  const socialLinks = [
    { url: organization.linkedin_url, icon: Linkedin, name: "LinkedIn" },
    { url: organization.twitter_url, icon: Twitter, name: "Twitter" },
    { url: organization.facebook_url, icon: Facebook, name: "Facebook" },
  ].filter(link => link.url);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {organization.logo_url ? (
              <img 
                src={organization.logo_url} 
                alt={`${organization.name} logo`}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-16 h-16 bg-gradient-to-br ${getGradientColor(organization.name)} rounded-lg flex items-center justify-center ${organization.logo_url ? 'hidden' : ''}`}>
              <span className="text-white font-medium text-lg">
                {getCompanyInitials(organization.name)}
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">{organization.name}</CardTitle>
                <div className="flex items-center space-x-4 mt-2">
                  {organization.website_url && (
                    <a 
                      href={organization.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      {organization.primary_domain || organization.website_url}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                  {organization.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-1" />
                      {organization.phone}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={link.name}
                  >
                    <link.icon className="w-4 h-4" />
                  </a>
                ))}
                <Button variant="outline" size="sm" onClick={handleToggleContacts}>
                  <Users className="w-3 h-3 mr-1" />
                  {showContacts ? "Hide Contacts" : "View Contacts"}
                  {showContacts ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                </Button>
              </div>
            </div>
            
            {organization.short_description && (
              <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                {organization.short_description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tech">Technology</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {organization.estimated_num_employees && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                  <div className="text-lg font-semibold text-gray-900">
                    {formatEmployeeCount(organization.estimated_num_employees)}
                  </div>
                  <div className="text-xs text-gray-500">Employees</div>
                </div>
              )}
              
              {organization.founded_year && (
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto text-green-600 mb-1" />
                  <div className="text-lg font-semibold text-gray-900">{organization.founded_year}</div>
                  <div className="text-xs text-gray-500">Founded</div>
                </div>
              )}
              
              {organization.industry && (
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Briefcase className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                  <div className="text-sm font-semibold text-gray-900 capitalize">{organization.industry}</div>
                  <div className="text-xs text-gray-500">Industry</div>
                </div>
              )}
              
              {(organization.city || organization.state || organization.country) && (
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <MapPin className="w-6 h-6 mx-auto text-orange-600 mb-1" />
                  <div className="text-sm font-semibold text-gray-900">
                    {[organization.city, organization.state, organization.country].filter(Boolean).join(", ")}
                  </div>
                  <div className="text-xs text-gray-500">Location</div>
                </div>
              )}
            </div>
            
            {organization.keywords && organization.keywords.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {organization.keywords.slice(0, 10).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {organization.keywords.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{organization.keywords.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Company Information</h4>
                {organization.raw_address && (
                  <div className="text-sm">
                    <span className="text-gray-500">Address:</span>
                    <p className="mt-1">{organization.raw_address}</p>
                  </div>
                )}
                {organization.industries && organization.industries.length > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-500">Industries:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {organization.industries.map((industry, index) => (
                        <Badge key={index} variant="outline" className="text-xs capitalize">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {organization.alexa_ranking && (
                  <div className="text-sm">
                    <span className="text-gray-500">Alexa Ranking:</span>
                    <span className="ml-2 font-medium">{organization.alexa_ranking.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Funding Information</h4>
                {organization.total_funding_printed ? (
                  <div className="text-sm">
                    <span className="text-gray-500">Total Funding:</span>
                    <span className="ml-2 font-medium">{organization.total_funding_printed}</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No funding information available</div>
                )}
                {organization.latest_funding_stage && (
                  <div className="text-sm">
                    <span className="text-gray-500">Latest Stage:</span>
                    <span className="ml-2 font-medium capitalize">{organization.latest_funding_stage}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tech" className="space-y-4">
            {organization.current_technologies && organization.current_technologies.length > 0 ? (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Technology Stack</h4>
                <div className="space-y-3">
                  {Object.entries(
                    organization.current_technologies.reduce((acc, tech) => {
                      if (!acc[tech.category]) acc[tech.category] = [];
                      acc[tech.category].push(tech);
                      return acc;
                    }, {} as Record<string, typeof organization.current_technologies>)
                  ).map(([category, techs]) => (
                    <div key={category}>
                      <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                        {category}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {techs.map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Code className="w-3 h-3 mr-1" />
                            {tech.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No technology information available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            {getDepartmentData().length > 0 ? (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Department Breakdown</h4>
                <div className="space-y-2">
                  {getDepartmentData().map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{dept.name}</span>
                      <Badge variant="secondary">{dept.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            
            {showContacts && (
              <div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900">Key Contacts</h4>
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
                      <div key={contact.id || index} className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
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
                  <div className="text-center py-6">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Contact data not available</p>
                    <p className="text-xs text-gray-400 mt-1">This feature may require Apollo premium access</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
