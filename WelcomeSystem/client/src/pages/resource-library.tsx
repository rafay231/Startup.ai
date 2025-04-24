import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Resource } from "@shared/schema";
import { INDUSTRIES } from "@/lib/constants";
import { 
  Search, 
  Filter, 
  Loader2, 
  FileText, 
  BookOpen, 
  BarChart4, 
  File, 
  FilePieChart, 
  Scale,
  Download,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResourceLibrary() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Fetch all resources
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  // Resource categories
  const categories = [
    { id: "Business Plan Templates", icon: FileText },
    { id: "Market Research Guides", icon: BarChart4 },
    { id: "Financial Models", icon: FilePieChart },
    { id: "Pitch Deck Templates", icon: File },
    { id: "Legal Templates", icon: Scale },
  ];

  // Filter resources based on selected filters and search query
  const filteredResources = resources?.filter((resource) => {
    const matchesCategory = selectedCategory ? resource.category === selectedCategory : true;
    const matchesIndustry = selectedIndustry 
      ? resource.industry === selectedIndustry || resource.industry === null 
      : true;
    const matchesQuery = searchQuery 
      ? resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    return matchesCategory && matchesIndustry && matchesQuery;
  });

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const handleDownload = (resource: Resource) => {
    // In a real app, this would trigger a download
    // For now, we'll just show a toast
    toast({
      title: "Download started",
      description: `${resource.title} is downloading.`,
    });
  };

  return (
    <MainLayout title="Resource Library" subtitle="Access templates, guides, and tools for your startup journey">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
              <CardDescription>Find the resources you need</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Search resources..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="All industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All industries</SelectItem>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedIndustry("");
                  setSearchQuery("");
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resource Categories</CardTitle>
              <CardDescription>Browse by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="mr-2 h-4 w-4" />
                    {category.id}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Resource List and Details */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold mr-2">Resources</h2>
                  <Badge variant="outline" className="ml-2">
                    {filteredResources?.length || 0} items
                  </Badge>
                </div>
                <TabsList>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="grid" className="mt-0">
                {filteredResources?.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium">No resources found</h3>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredResources?.map((resource) => (
                      <Card 
                        key={resource.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleResourceClick(resource)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.description || resource.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center text-sm text-gray-500">
                            <Badge variant="secondary" className="mr-2">
                              {resource.category}
                            </Badge>
                            {resource.industry && (
                              <Badge variant="outline">{resource.industry}</Badge>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button variant="ghost" size="sm" onClick={() => handleResourceClick(resource)}>
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="list" className="mt-0">
                {filteredResources?.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium">No resources found</h3>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <div className="divide-y">
                      {filteredResources?.map((resource) => (
                        <div 
                          key={resource.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleResourceClick(resource)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{resource.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">{resource.description || "No description available"}</p>
                              <div className="flex items-center mt-2">
                                <Badge variant="secondary" className="mr-2">
                                  {resource.category}
                                </Badge>
                                {resource.industry && (
                                  <Badge variant="outline">{resource.industry}</Badge>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          {/* Resource Detail View */}
          {selectedResource && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedResource.title}</CardTitle>
                    <CardDescription>{selectedResource.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(selectedResource)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedResource(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{selectedResource.category}</Badge>
                  {selectedResource.industry && (
                    <Badge variant="outline">{selectedResource.industry}</Badge>
                  )}
                  <Badge variant="outline">{selectedResource.format}</Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                {selectedResource.format === "markdown" ? (
                  <div className="prose max-w-none">
                    {selectedResource.content.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-lg font-bold mt-3 mb-1">{line.substring(4)}</h3>;
                      } else if (line.startsWith('- ')) {
                        return <li key={index} className="ml-5">{line.substring(2)}</li>;
                      } else if (line.startsWith('|')) {
                        // Simple table rendering
                        return <div key={index} className="font-mono text-sm">{line}</div>;
                      } else if (line.trim() === '') {
                        return <br key={index} />;
                      } else {
                        return <p key={index} className="my-2">{line}</p>;
                      }
                    })}
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap">{selectedResource.content}</pre>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="link" size="sm" className="text-gray-500">
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Open in Editor
                </Button>
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedResource(null)}>
                    Close
                  </Button>
                  <Button 
                    className="ml-2" 
                    size="sm"
                    onClick={() => handleDownload(selectedResource)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
