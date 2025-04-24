import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RevenueModel, Startup } from "@shared/schema";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  AlertCircle, 
  Loader2,
  Plus,
  Trash2,
  Coins,
  DollarSign,
  Calculator
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
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MainLayout from "@/layouts/MainLayout";
import ProgressTracker from "@/components/ProgressTracker";

// Schema for form validation
const revenueModelSchema = z.object({
  revenueStreams: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    estimatedPercentage: z.string().optional(),
    pricingModel: z.string().optional(),
  })).min(1, "Add at least one revenue stream"),
  pricingStrategy: z.string().min(10, "Pricing strategy must be at least 10 characters"),
  financialProjections: z.object({
    initialInvestment: z.string().optional(),
    monthlyExpenses: z.string().optional(),
    projectedRevenueYear1: z.string().optional(),
    projectedRevenueYear2: z.string().optional(),
    projectedRevenueYear3: z.string().optional(),
    targetMargin: z.string().optional(),
    breakevenTimeline: z.string().optional(),
    notes: z.string().optional(),
  }),
});

type RevenueModelFormValues = z.infer<typeof revenueModelSchema>;

export default function RevenueWizard() {
  const { startupId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const parsedStartupId = parseInt(startupId);
  
  // Get startup details
  const { data: startup, isLoading: startupLoading } = useQuery<Startup>({
    queryKey: [`/api/startups/${startupId}`],
  });

  // Get existing revenue model if available
  const { 
    data: existingModel, 
    isLoading: modelLoading,
    isError: modelError
  } = useQuery<RevenueModel>({
    queryKey: [`/api/startups/${startupId}/revenue`],
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no model exists yet)
      if (error.message.includes("404")) return false;
      return failureCount < 3;
    },
  });

  // Default form values
  const defaultFormValues: RevenueModelFormValues = {
    revenueStreams: [{
      name: "",
      description: "",
      estimatedPercentage: "",
      pricingModel: "",
    }],
    pricingStrategy: "",
    financialProjections: {
      initialInvestment: "",
      monthlyExpenses: "",
      projectedRevenueYear1: "",
      projectedRevenueYear2: "",
      projectedRevenueYear3: "",
      targetMargin: "",
      breakevenTimeline: "",
      notes: "",
    },
  };

  const form = useForm<RevenueModelFormValues>({
    resolver: zodResolver(revenueModelSchema),
    defaultValues: defaultFormValues,
  });

  // Fill form with existing data when loaded
  useEffect(() => {
    if (existingModel) {
      // Cast JSON data to our form types
      const revenueStreams = existingModel.revenueStreams as any[] || [{
        name: "",
        description: "",
        estimatedPercentage: "",
        pricingModel: "",
      }];
      
      const financialProjections = existingModel.financialProjections as {
        initialInvestment?: string,
        monthlyExpenses?: string,
        projectedRevenueYear1?: string,
        projectedRevenueYear2?: string,
        projectedRevenueYear3?: string,
        targetMargin?: string,
        breakevenTimeline?: string,
        notes?: string,
      } || {};
      
      form.reset({
        revenueStreams,
        pricingStrategy: existingModel.pricingStrategy || "",
        financialProjections,
      });
    }
  }, [existingModel, form]);

  const saveRevenueModelMutation = useMutation({
    mutationFn: async (data: RevenueModelFormValues) => {
      const res = await apiRequest("POST", `/api/startups/${startupId}/revenue`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Revenue model saved",
        description: "Your revenue model has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}/revenue`] });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save revenue model",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RevenueModelFormValues) => {
    saveRevenueModelMutation.mutate(data);
  };

  const handleSaveAndContinue = async () => {
    if (form.formState.isValid) {
      const values = form.getValues();
      await saveRevenueModelMutation.mutateAsync(values);
      navigate(`/startups/${startupId}/mvp`);
    } else {
      form.trigger();
    }
  };

  const handleBack = () => {
    navigate(`/startups/${startupId}/competition`);
  };

  // Add a new revenue stream
  const addRevenueStream = () => {
    const currentStreams = form.getValues("revenueStreams");
    form.setValue("revenueStreams", [
      ...currentStreams, 
      { 
        name: "", 
        description: "", 
        estimatedPercentage: "", 
        pricingModel: "" 
      }
    ]);
  };

  // Remove a revenue stream
  const removeRevenueStream = (index: number) => {
    const currentStreams = form.getValues("revenueStreams");
    if (currentStreams.length > 1) {
      form.setValue(
        "revenueStreams",
        currentStreams.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "Cannot remove",
        description: "You must have at least one revenue stream.",
        variant: "destructive",
      });
    }
  };

  // Pricing model options
  const pricingModels = [
    "Subscription",
    "One-time purchase",
    "Freemium",
    "Usage-based",
    "Tiered pricing",
    "Ad-supported",
    "Licensing",
    "Transaction fee",
    "Affiliate commission",
    "Other"
  ];

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
          disabled={saveRevenueModelMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Progress
        </Button>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker currentStep="revenue" startupId={parsedStartupId} />

      {/* Revenue Model Form */}
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-900">Define Your Revenue Model</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Outline how your startup will generate revenue and achieve financial sustainability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Revenue Streams Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Revenue Streams</h3>
                  <Button 
                    type="button" 
                    onClick={addRevenueStream} 
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Revenue Stream
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {form.watch("revenueStreams").map((_, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Revenue Stream {index + 1}</h4>
                          <Button
                            type="button"
                            onClick={() => removeRevenueStream(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            disabled={form.watch("revenueStreams").length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`revenueStreams.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Revenue Stream Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Subscription Service" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`revenueStreams.${index}.estimatedPercentage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimated % of Total Revenue</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 70%" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`revenueStreams.${index}.pricingModel`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pricing Model</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select pricing model" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {pricingModels.map((model) => (
                                      <SelectItem key={model} value={model}>
                                        {model}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`revenueStreams.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe how this revenue stream works"
                                    {...field}
                                    rows={2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {form.formState.errors.revenueStreams && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.revenueStreams.message}
                  </p>
                )}
              </div>

              {/* Pricing Strategy */}
              <FormField
                control={form.control}
                name="pricingStrategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Strategy</FormLabel>
                    <FormDescription>
                      Explain your overall approach to pricing, including competitive positioning, 
                      value-based pricing, market penetration, or premium strategies
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Detail your pricing strategy and rationale..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Financial Projections */}
              <div>
                <h3 className="text-lg font-medium mb-4">Financial Projections</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="financialProjections.initialInvestment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Investment Required</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input placeholder="e.g., 50000" className="pl-8" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="financialProjections.monthlyExpenses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Monthly Expenses</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input placeholder="e.g., 5000" className="pl-8" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="financialProjections.projectedRevenueYear1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Projected Revenue (Year 1)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input placeholder="e.g., 100000" className="pl-8" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="financialProjections.projectedRevenueYear2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Projected Revenue (Year 2)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input placeholder="e.g., 250000" className="pl-8" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="financialProjections.projectedRevenueYear3"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Projected Revenue (Year 3)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input placeholder="e.g., 500000" className="pl-8" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="financialProjections.targetMargin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Profit Margin</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 25%" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="financialProjections.breakevenTimeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Breakeven Timeline</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 18 months" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="financialProjections.notes"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Financial Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional notes about your financial projections"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Help Section */}
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Coins className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">Revenue Model Importance</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>A well-defined revenue model helps you:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Clearly identify your primary sources of income</li>
                        <li>Set realistic financial projections for fundraising</li>
                        <li>Determine the viability and sustainability of your business</li>
                        <li>Guide strategic decisions around pricing and market positioning</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Recommendations */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-medium text-purple-800 mb-2">
                  <svg className="inline-block mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10Z"></path>
                    <path d="M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"></path>
                    <path d="M21.17 8h-1.84"></path>
                    <path d="M16.54 5 15.17 6.25"></path>
                    <path d="M12 2.5v1.67"></path>
                    <path d="m7.46 5 1.37 1.25"></path>
                    <path d="M2.83 8h1.84"></path>
                    <path d="M5.46 12 2.5 12"></path>
                    <path d="M7.46 19 6.09 17.75"></path>
                    <path d="M12 21.5v-1.67"></path>
                    <path d="m16.54 19-1.37-1.25"></path>
                    <path d="M21.17 12h-1.84"></path>
                  </svg>
                  AI Revenue Recommendations
                </h3>
                <div className="text-sm text-purple-700 space-y-2">
                  <p><strong>Revenue Mix:</strong> For {startup.industry} startups, a combination of subscription and usage-based pricing often maximizes customer lifetime value.</p>
                  <p><strong>Pricing Strategy:</strong> Consider value-based pricing tied to measurable outcomes that your solution provides to customers.</p>
                  <p><strong>Growth Tips:</strong> Implement a tiered pricing structure that allows customers to upgrade as they realize more value from your product.</p>
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
          Previous: Competition
        </Button>
        <Button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={saveRevenueModelMutation.isPending}
        >
          {saveRevenueModelMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next: MVP
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </MainLayout>
  );
}
