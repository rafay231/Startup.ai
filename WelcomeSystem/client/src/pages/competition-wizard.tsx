import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Competitor, Startup } from "@shared/schema";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  AlertCircle, 
  Loader2,
  Plus,
  Trash2,
  PieChart
} from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MainLayout from "@/layouts/MainLayout";
import ProgressTracker from "@/components/ProgressTracker";

// Schema for form validation
const competitorSchema = z.object({
  competitorData: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    strengths: z.string().optional(),
    weaknesses: z.string().optional(),
    marketShare: z.string().optional(),
    keyDifferentiator: z.string().optional(),
  })).min(1, "Add at least one competitor"),
  swotAnalysis: z.object({
    strengths: z.array(z.string()).min(1, "Add at least one strength"),
    weaknesses: z.array(z.string()).min(1, "Add at least one weakness"),
    opportunities: z.array(z.string()).min(1, "Add at least one opportunity"),
    threats: z.array(z.string()).min(1, "Add at least one threat"),
  }),
  marketPositioning: z.string().min(10, "Market positioning must be at least 10 characters"),
});

type CompetitorFormValues = z.infer<typeof competitorSchema>;

export default function CompetitionWizard() {
  const { startupId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const parsedStartupId = parseInt(startupId);
  
  // State for managing SWOT items
  const [newStrength, setNewStrength] = useState("");
  const [newWeakness, setNewWeakness] = useState("");
  const [newOpportunity, setNewOpportunity] = useState("");
  const [newThreat, setNewThreat] = useState("");
  
  // Get startup details
  const { data: startup, isLoading: startupLoading } = useQuery<Startup>({
    queryKey: [`/api/startups/${startupId}`],
  });

  // Get existing competitor data if available
  const { 
    data: existingCompetitor, 
    isLoading: competitorLoading,
    isError: competitorError
  } = useQuery<Competitor>({
    queryKey: [`/api/startups/${startupId}/competition`],
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no competitor data exists yet)
      if (error.message.includes("404")) return false;
      return failureCount < 3;
    },
  });

  // Default form values
  const defaultFormValues: CompetitorFormValues = {
    competitorData: [{
      name: "",
      strengths: "",
      weaknesses: "",
      marketShare: "",
      keyDifferentiator: "",
    }],
    swotAnalysis: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
    marketPositioning: "",
  };

  const form = useForm<CompetitorFormValues>({
    resolver: zodResolver(competitorSchema),
    defaultValues: defaultFormValues,
  });

  // Fill form with existing data when loaded
  useEffect(() => {
    if (existingCompetitor) {
      // Cast JSON data to our form types
      const competitorData = existingCompetitor.competitorData as any[] || [{ 
        name: "", 
        strengths: "", 
        weaknesses: "", 
        marketShare: "", 
        keyDifferentiator: "" 
      }];
      
      const swotAnalysis = existingCompetitor.swotAnalysis as {
        strengths: string[],
        weaknesses: string[],
        opportunities: string[],
        threats: string[]
      } || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
      
      form.reset({
        competitorData,
        swotAnalysis,
        marketPositioning: existingCompetitor.marketPositioning || "",
      });
    }
  }, [existingCompetitor, form]);

  const saveCompetitorMutation = useMutation({
    mutationFn: async (data: CompetitorFormValues) => {
      const res = await apiRequest("POST", `/api/startups/${startupId}/competition`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Competition analysis saved",
        description: "Your competition analysis has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}/competition`] });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save competition analysis",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompetitorFormValues) => {
    saveCompetitorMutation.mutate(data);
  };

  const handleSaveAndContinue = async () => {
    if (form.formState.isValid) {
      const values = form.getValues();
      await saveCompetitorMutation.mutateAsync(values);
      navigate(`/startups/${startupId}/revenue`);
    } else {
      form.trigger();
    }
  };

  const handleBack = () => {
    navigate(`/startups/${startupId}/business-model`);
  };

  // Add a new competitor
  const addCompetitor = () => {
    const currentCompetitors = form.getValues("competitorData");
    form.setValue("competitorData", [
      ...currentCompetitors, 
      { 
        name: "", 
        strengths: "", 
        weaknesses: "", 
        marketShare: "", 
        keyDifferentiator: "" 
      }
    ]);
  };

  // Remove a competitor
  const removeCompetitor = (index: number) => {
    const currentCompetitors = form.getValues("competitorData");
    if (currentCompetitors.length > 1) {
      form.setValue(
        "competitorData",
        currentCompetitors.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "Cannot remove",
        description: "You must have at least one competitor.",
        variant: "destructive",
      });
    }
  };

  // SWOT analysis handlers
  const addStrength = () => {
    if (newStrength.trim()) {
      const strengths = form.getValues("swotAnalysis.strengths");
      form.setValue("swotAnalysis.strengths", [...strengths, newStrength.trim()]);
      setNewStrength("");
    }
  };

  const removeStrength = (index: number) => {
    const strengths = form.getValues("swotAnalysis.strengths");
    form.setValue(
      "swotAnalysis.strengths",
      strengths.filter((_, i) => i !== index)
    );
  };

  const addWeakness = () => {
    if (newWeakness.trim()) {
      const weaknesses = form.getValues("swotAnalysis.weaknesses");
      form.setValue("swotAnalysis.weaknesses", [...weaknesses, newWeakness.trim()]);
      setNewWeakness("");
    }
  };

  const removeWeakness = (index: number) => {
    const weaknesses = form.getValues("swotAnalysis.weaknesses");
    form.setValue(
      "swotAnalysis.weaknesses",
      weaknesses.filter((_, i) => i !== index)
    );
  };

  const addOpportunity = () => {
    if (newOpportunity.trim()) {
      const opportunities = form.getValues("swotAnalysis.opportunities");
      form.setValue("swotAnalysis.opportunities", [...opportunities, newOpportunity.trim()]);
      setNewOpportunity("");
    }
  };

  const removeOpportunity = (index: number) => {
    const opportunities = form.getValues("swotAnalysis.opportunities");
    form.setValue(
      "swotAnalysis.opportunities",
      opportunities.filter((_, i) => i !== index)
    );
  };

  const addThreat = () => {
    if (newThreat.trim()) {
      const threats = form.getValues("swotAnalysis.threats");
      form.setValue("swotAnalysis.threats", [...threats, newThreat.trim()]);
      setNewThreat("");
    }
  };

  const removeThreat = (index: number) => {
    const threats = form.getValues("swotAnalysis.threats");
    form.setValue(
      "swotAnalysis.threats",
      threats.filter((_, i) => i !== index)
    );
  };

  if (startupLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!startup) {
    return (
      <MainLayout>
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Startup Not Found</h1>
            </div>
            <p className="mt-2 text-gray-600">
              The startup you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Create Your Startup"
      subtitle="Complete these steps to build your startup foundation"
    >
      {/* Save Progress Button */}
      <div className="flex justify-end mb-2">
        <Button 
          variant="outline" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={saveCompetitorMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Progress
        </Button>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker currentStep="competition" startupId={parsedStartupId} />

      {/* Competition Analysis Form */}
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-900">Analyze Your Competition</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Understand your market landscape and competitive positioning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Competitor Table */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Key Competitors</h3>
                  <Button 
                    type="button" 
                    onClick={addCompetitor} 
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Competitor
                  </Button>
                </div>
                
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Strengths</TableHead>
                        <TableHead>Weaknesses</TableHead>
                        <TableHead>Market Share</TableHead>
                        <TableHead>Key Differentiator</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.watch("competitorData").map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`competitorData.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Competitor name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`competitorData.${index}.strengths`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Key strengths" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`competitorData.${index}.weaknesses`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Key weaknesses" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`competitorData.${index}.marketShare`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Est. market share" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`competitorData.${index}.keyDifferentiator`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Differentiator" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              onClick={() => removeCompetitor(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              disabled={form.watch("competitorData").length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {form.formState.errors.competitorData && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.competitorData.message}
                  </p>
                )}
              </div>

              {/* SWOT Analysis */}
              <div>
                <h3 className="text-lg font-medium mb-4">SWOT Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Strengths</CardTitle>
                      <CardDescription>What advantages does your startup have?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="swotAnalysis.strengths"
                        render={({ field }) => (
                          <FormItem>
                            <div className="space-y-4">
                              {field.value.length > 0 ? (
                                <ul className="space-y-2">
                                  {field.value.map((strength, index) => (
                                    <li key={index} className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                                      <span className="text-sm">{strength}</span>
                                      <Button
                                        type="button"
                                        onClick={() => removeStrength(index)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No strengths added yet</p>
                              )}
                              <div className="flex gap-2">
                                <Input
                                  value={newStrength}
                                  onChange={(e) => setNewStrength(e.target.value)}
                                  placeholder="Add a strength"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addStrength();
                                    }
                                  }}
                                />
                                <Button type="button" size="sm" onClick={addStrength}>Add</Button>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  {/* Weaknesses */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Weaknesses</CardTitle>
                      <CardDescription>What could you improve?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="swotAnalysis.weaknesses"
                        render={({ field }) => (
                          <FormItem>
                            <div className="space-y-4">
                              {field.value.length > 0 ? (
                                <ul className="space-y-2">
                                  {field.value.map((weakness, index) => (
                                    <li key={index} className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                                      <span className="text-sm">{weakness}</span>
                                      <Button
                                        type="button"
                                        onClick={() => removeWeakness(index)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No weaknesses added yet</p>
                              )}
                              <div className="flex gap-2">
                                <Input
                                  value={newWeakness}
                                  onChange={(e) => setNewWeakness(e.target.value)}
                                  placeholder="Add a weakness"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addWeakness();
                                    }
                                  }}
                                />
                                <Button type="button" size="sm" onClick={addWeakness}>Add</Button>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  {/* Opportunities */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Opportunities</CardTitle>
                      <CardDescription>What market opportunities can you exploit?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="swotAnalysis.opportunities"
                        render={({ field }) => (
                          <FormItem>
                            <div className="space-y-4">
                              {field.value.length > 0 ? (
                                <ul className="space-y-2">
                                  {field.value.map((opportunity, index) => (
                                    <li key={index} className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                                      <span className="text-sm">{opportunity}</span>
                                      <Button
                                        type="button"
                                        onClick={() => removeOpportunity(index)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No opportunities added yet</p>
                              )}
                              <div className="flex gap-2">
                                <Input
                                  value={newOpportunity}
                                  onChange={(e) => setNewOpportunity(e.target.value)}
                                  placeholder="Add an opportunity"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addOpportunity();
                                    }
                                  }}
                                />
                                <Button type="button" size="sm" onClick={addOpportunity}>Add</Button>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  {/* Threats */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Threats</CardTitle>
                      <CardDescription>What obstacles could harm your startup?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="swotAnalysis.threats"
                        render={({ field }) => (
                          <FormItem>
                            <div className="space-y-4">
                              {field.value.length > 0 ? (
                                <ul className="space-y-2">
                                  {field.value.map((threat, index) => (
                                    <li key={index} className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                                      <span className="text-sm">{threat}</span>
                                      <Button
                                        type="button"
                                        onClick={() => removeThreat(index)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No threats added yet</p>
                              )}
                              <div className="flex gap-2">
                                <Input
                                  value={newThreat}
                                  onChange={(e) => setNewThreat(e.target.value)}
                                  placeholder="Add a threat"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addThreat();
                                    }
                                  }}
                                />
                                <Button type="button" size="sm" onClick={addThreat}>Add</Button>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Market Positioning */}
              <FormField
                control={form.control}
                name="marketPositioning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Positioning</FormLabel>
                    <FormDescription>
                      Describe how your startup is positioned relative to competitors and what makes your
                      offering unique in the market
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Explain your unique market positioning and competitive advantage"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Help Section */}
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <PieChart className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">Understanding Your Competition</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>A thorough competitive analysis helps you:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Identify gaps in the market that your startup can fill</li>
                        <li>Learn from competitors' successes and mistakes</li>
                        <li>Develop a clear differentiation strategy</li>
                        <li>Anticipate competitive responses to your market entry</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous: Business Model
        </Button>
        <Button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={saveCompetitorMutation.isPending}
        >
          {saveCompetitorMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next: Revenue Model
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </MainLayout>
  );
}
