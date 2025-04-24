import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/layouts/MainLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Startup } from "@shared/schema";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FilePieChart, 
  File, 
  Presentation,
  Loader2,
  Check,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";

type ExportFormat = "pdf" | "docx" | "xlsx" | "pptx";
type ExportSection = "businessPlan" | "financialPlan" | "pitchDeck" | "marketingPlan" | "mvp";

interface ExportOption {
  id: ExportSection;
  label: string;
  description: string;
  icon: React.ElementType;
}

export default function ExportMaterials() {
  const { toast } = useToast();
  const [selectedStartupId, setSelectedStartupId] = useState<number | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [selectedSections, setSelectedSections] = useState<ExportSection[]>([
    "businessPlan", "financialPlan", "pitchDeck"
  ]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  
  // Get user's startups
  const { data: startups, isLoading: startupsLoading } = useQuery<Startup[]>({
    queryKey: ["/api/startups"],
  });

  // Export options
  const exportOptions: ExportOption[] = [
    {
      id: "businessPlan",
      label: "Business Plan",
      description: "Complete business plan based on your startup information",
      icon: FileText
    },
    {
      id: "financialPlan",
      label: "Financial Plan",
      description: "Financial projections and analysis for your startup",
      icon: FileSpreadsheet
    },
    {
      id: "pitchDeck",
      label: "Pitch Deck",
      description: "Presentation slides for investors and stakeholders",
      icon: Presentation
    },
    {
      id: "marketingPlan",
      label: "Marketing Plan",
      description: "Strategic marketing plan based on your target audience",
      icon: File
    },
    {
      id: "mvp",
      label: "MVP Roadmap",
      description: "Detailed plan for your minimum viable product",
      icon: FilePieChart
    }
  ];

  // Get startup name by ID
  const getStartupName = (startupId: number) => {
    const startup = startups?.find(s => s.id === startupId);
    return startup?.name || "Unknown Startup";
  };
  
  // Get startup progress percentage
  const getStartupProgress = (startupId: number) => {
    const startup = startups?.find(s => s.id === startupId);
    return startup?.progress || 0;
  };

  const handleToggleSection = (sectionId: ExportSection) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter(id => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };

  const handleGenerate = () => {
    if (!selectedStartupId) {
      toast({
        title: "No startup selected",
        description: "Please select a startup to generate materials.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedSections.length === 0) {
      toast({
        title: "No sections selected",
        description: "Please select at least one section to include in your export.",
        variant: "destructive",
      });
      return;
    }
    
    // Show generating state
    setIsGenerating(true);
    
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      
      toast({
        title: "Materials generated",
        description: "Your materials have been generated successfully.",
      });
    }, 3000);
  };

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: `Your materials are being downloaded in ${selectedFormat.toUpperCase()} format.`,
    });
  };
  
  const handleReset = () => {
    setIsGenerated(false);
  };

  return (
    <MainLayout title="Export Materials" subtitle="Generate and download startup materials">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configure Export</CardTitle>
              <CardDescription>Select what to include in your export package</CardDescription>
            </CardHeader>
            <CardContent>
              {startupsLoading ? (
                <div className="py-6 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : startups?.length === 0 ? (
                <div className="py-6 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No startups found</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Create a startup first to export materials
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Startup Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Startup</label>
                    <Select 
                      value={selectedStartupId?.toString() || ""} 
                      onValueChange={(value) => {
                        setSelectedStartupId(parseInt(value));
                        setIsGenerated(false);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a startup" />
                      </SelectTrigger>
                      <SelectContent>
                        {startups?.map((startup) => (
                          <SelectItem key={startup.id} value={startup.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{startup.name}</span>
                              <span className="text-xs text-gray-500">{startup.progress}% Complete</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedStartupId && getStartupProgress(selectedStartupId) < 100 && (
                      <div className="flex items-center mt-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                        <p className="text-sm text-yellow-600">
                          This startup is not fully complete. Exported materials may be missing some information.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Format Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Export Format</label>
                      <Tabs 
                        defaultValue="pdf" 
                        value={selectedFormat}
                        onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
                      >
                        <TabsList className="grid grid-cols-4">
                          <TabsTrigger value="pdf">PDF</TabsTrigger>
                          <TabsTrigger value="docx">DOCX</TabsTrigger>
                          <TabsTrigger value="xlsx">XLSX</TabsTrigger>
                          <TabsTrigger value="pptx">PPTX</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    
                    {/* Quick Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quick Selection</label>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSections(exportOptions.map(o => o.id))}
                        >
                          Select All
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSections([])}
                        >
                          Deselect All
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSections(["businessPlan", "financialPlan", "pitchDeck"])}
                        >
                          Investor Package
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Content to Include</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exportOptions.map((option) => (
                        <div 
                          key={option.id}
                          className={`flex items-start space-x-3 p-3 rounded-md border transition-colors ${
                            selectedSections.includes(option.id) 
                              ? "border-primary bg-primary/5" 
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleToggleSection(option.id)}
                        >
                          <Checkbox 
                            checked={selectedSections.includes(option.id)}
                            onCheckedChange={() => handleToggleSection(option.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <option.icon className="h-4 w-4 mr-2 text-primary" />
                              <h4 className="text-sm font-medium">{option.label}</h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !selectedStartupId || selectedSections.length === 0}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate Materials
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Preview Panel */}
        <div className="lg:col-span-1">
          {isGenerated ? (
            <Card>
              <CardHeader className="bg-green-50 border-b border-green-100">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-green-700">Ready to Download</CardTitle>
                    <CardDescription className="text-green-600">
                      Your materials have been generated
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <div>
                    <h3 className="font-medium">{getStartupName(selectedStartupId!)}</h3>
                    <p className="text-sm text-gray-500">Export Package</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Included Materials:</div>
                    <ul className="space-y-2">
                      {selectedSections.map(sectionId => {
                        const option = exportOptions.find(o => o.id === sectionId)!;
                        return (
                          <li key={sectionId} className="flex items-center text-sm">
                            <option.icon className="h-4 w-4 mr-2 text-primary" />
                            {option.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  
                  <div className="pt-3 flex flex-col gap-2">
                    <Button onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download {selectedFormat.toUpperCase()}
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reconfigure Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Export Preview</CardTitle>
                <CardDescription>
                  Generate your materials to see a preview
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-16 w-16 text-gray-200 mb-4" />
                <h3 className="text-lg font-medium text-gray-500">No Materials Generated</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-xs">
                  Select a startup and configure your export settings, then click Generate Materials.
                </p>
              </CardContent>
            </Card>
          )}
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Export Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex gap-2">
                  <div className="text-primary">💡</div>
                  <p>Complete all sections of your startup plan for the most comprehensive export materials.</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary">💡</div>
                  <p>PDF format is best for printing and sharing, while DOCX allows for editing.</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary">💡</div>
                  <p>The Investor Package includes the three most essential documents needed for fundraising.</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary">💡</div>
                  <p>You can regenerate your materials at any time as you update your startup information.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
