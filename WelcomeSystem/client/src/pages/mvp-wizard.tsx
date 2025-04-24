import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mvp, Startup } from "@shared/schema";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  AlertCircle, 
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Rocket,
  X
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MainLayout from "@/layouts/MainLayout";
import ProgressTracker from "@/components/ProgressTracker";

// Schema for form validation
const mvpSchema = z.object({
  features: z.array(z.object({
    name: z.string().min(1, "Feature name is required"),
    description: z.string().optional(),
    priority: z.string().min(1, "Priority is required"),
    status: z.string().optional(),
  })).min(1, "Add at least one feature"),
  timeline: z.array(z.object({
    milestone: z.string().min(1, "Milestone is required"),
    deliveryDate: z.string().min(1, "Delivery date is required"),
    description: z.string().optional(),
  })).min(1, "Add at least one timeline milestone"),
  resources: z.array(z.string()).min(1, "Add at least one resource"),
  success_criteria: z.array(z.object({
    criterion: z.string().min(1, "Success criterion is required"),
    metric: z.string().optional(),
    target: z.string().optional(),
  })).min(1, "Add at least one success criterion"),
});

type MvpFormValues = z.infer<typeof mvpSchema>;

export default function MvpWizard() {
  const { startupId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const parsedStartupId = parseInt(startupId);
  
  // State for resource tag input
  const [newResource, setNewResource] = useState("");
  
  // Get startup details
  const { data: startup, isLoading: startupLoading } = useQuery<Startup>({
    queryKey: [`/api/startups/${startupId}`],
  });

  // Get existing MVP data if available
  const { 
    data: existingMvp, 
    isLoading: mvpLoading,
    isError: mvpError
  } = useQuery<Mvp>({
    queryKey: [`/api/startups/${startupId}/mvp`],
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no MVP exists yet)
      if (error.message.includes("404")) return false;
      return failureCount < 3;
    },
  });

  // Default form values
  const defaultFormValues: MvpFormValues = {
    features: [{
      name: "",
      description: "",
      priority: "high",
      status: "planned",
    }],
    timeline: [{
      milestone: "",
      deliveryDate: "",
      description: "",
    }],
    resources: [],
    success_criteria: [{
      criterion: "",
      metric: "",
      target: "",
    }],
  };

  const form = useForm<MvpFormValues>({
    resolver: zodResolver(mvpSchema),
    defaultValues: defaultFormValues,
  });

  // Fill form with existing data when loaded
  useEffect(() => {
    if (existingMvp) {
      // Cast JSON data to our form types
      const features = existingMvp.features as any[] || [{
        name: "",
        description: "",
        priority: "high",
        status: "planned",
      }];
      
      const timeline = existingMvp.timeline as any[] || [{
        milestone: "",
        deliveryDate: "",
        description: "",
      }];
      
      const resources = existingMvp.resources as string[] || [];
      
      const success_criteria = existingMvp.success_criteria as any[] || [{
        criterion: "",
        metric: "",
        target: "",
      }];
      
      form.reset({
        features,
        timeline,
        resources,
        success_criteria,
      });
    }
  }, [existingMvp, form]);

  const saveMvpMutation = useMutation({
    mutationFn: async (data: MvpFormValues) => {
      const res = await apiRequest("POST", `/api/startups/${startupId}/mvp`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "MVP plan saved",
        description: "Your MVP plan has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}/mvp`] });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save MVP plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MvpFormValues) => {
    saveMvpMutation.mutate(data);
  };

  const handleSaveAndComplete = async () => {
    if (form.formState.isValid) {
      const values = form.getValues();
      await saveMvpMutation.mutateAsync(values);
      navigate(`/`);
      toast({
        title: "Startup plan completed",
        description: "Congratulations! You've completed all steps of your startup planning process.",
      });
    } else {
      form.trigger();
    }
  };

  const handleBack = () => {
    navigate(`/startups/${startupId}/revenue`);
  };

  // Add/remove feature
  const addFeature = () => {
    const currentFeatures = form.getValues("features");
    form.setValue("features", [
      ...currentFeatures, 
      { 
        name: "", 
        description: "", 
        priority: "medium", 
        status: "planned" 
      }
    ]);
  };

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues("features");
    if (currentFeatures.length > 1) {
      form.setValue(
        "features",
        currentFeatures.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "Cannot remove",
        description: "You must have at least one feature.",
        variant: "destructive",
      });
    }
  };

  // Add/remove timeline milestone
  const addMilestone = () => {
    const currentTimeline = form.getValues("timeline");
    form.setValue("timeline", [
      ...currentTimeline, 
      { 
        milestone: "", 
        deliveryDate: "", 
        description: "" 
      }
    ]);
  };

  const removeMilestone = (index: number) => {
    const currentTimeline = form.getValues("timeline");
    if (currentTimeline.length > 1) {
      form.setValue(
        "timeline",
        currentTimeline.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "Cannot remove",
        description: "You must have at least one timeline milestone.",
        variant: "destructive",
      });
    }
  };

  // Add/remove success criterion
  const addCriterion = () => {
    const currentCriteria = form.getValues("success_criteria");
    form.setValue("success_criteria", [
      ...currentCriteria, 
      { 
        criterion: "", 
        metric: "", 
        target: "" 
      }
    ]);
  };

  const removeCriterion = (index: number) => {
    const currentCriteria = form.getValues("success_criteria");
    if (currentCriteria.length > 1) {
      form.setValue(
        "success_criteria",
        currentCriteria.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "Cannot remove",
        description: "You must have at least one success criterion.",
        variant: "destructive",
      });
    }
  };

  // Add/remove resource
  const addResource = () => {
    if (newResource.trim()) {
      const currentResources = form.getValues("resources");
      if (!currentResources.includes(newResource.trim())) {
        form.setValue("resources", [...currentResources, newResource.trim()]);
      }
      setNewResource("");
    }
  };

  const removeResource = (resource: string) => {
    const currentResources = form.getValues("resources");
    form.setValue(
      "resources",
      currentResources.filter(r => r !== resource)
    );
  };

  // Priority options
  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  // Status options
  const statusOptions = [
    { value: "planned", label: "Planned" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "deferred", label: "Deferred" },
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
          disabled={saveMvpMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Progress
        </Button>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker currentStep="mvp" startupId={parsedStartupId} />

      {/* MVP Form */}
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-900">Define Your Minimum Viable Product (MVP)</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Outline the core features, timeline, and success criteria for your initial product launch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Features Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Core Features</h3>
                  <Button 
                    type="button" 
                    onClick={addFeature} 
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {form.watch("features").map((_, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Feature {index + 1}</h4>
                          <Button
                            type="button"
                            onClick={() => removeFeature(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            disabled={form.watch("features").length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`features.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Feature Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., User Registration" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`features.${index}.priority`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Priority</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {priorityOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
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
                              name={`features.${index}.status`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`features.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe this feature and its functionality"
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
                {form.formState.errors.features && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.features.message}
                  </p>
                )}
              </div>

              {/* Timeline Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Development Timeline</h3>
                  <Button 
                    type="button" 
                    onClick={addMilestone} 
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Milestone
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {form.watch("timeline").map((_, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Milestone {index + 1}</h4>
                          <Button
                            type="button"
                            onClick={() => removeMilestone(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            disabled={form.watch("timeline").length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`timeline.${index}.milestone`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Milestone</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Alpha Release" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`timeline.${index}.deliveryDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Q3 2023 or 30 days after kickoff" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`timeline.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe what will be delivered in this milestone"
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
                {form.formState.errors.timeline && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.timeline.message}
                  </p>
                )}
              </div>

              {/* Resources Section */}
              <FormField
                control={form.control}
                name="resources"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-4">
                      <FormLabel className="text-lg font-medium m-0">Required Resources</FormLabel>
                    </div>
                    <FormDescription>
                      List the key resources needed to build your MVP (people, technology, tools, funding, etc.)
                    </FormDescription>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {field.value.map((resource) => (
                          <Badge key={resource} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {resource}
                            <button 
                              type="button" 
                              className="ml-1 inline-flex text-blue-600 focus:outline-none"
                              onClick={() => removeResource(resource)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newResource}
                          onChange={(e) => setNewResource(e.target.value)}
                          placeholder="Add resource (e.g., Frontend Developer, AWS Services)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addResource();
                            }
                          }}
                        />
                        <Button type="button" size="sm" onClick={addResource}>Add</Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Success Criteria Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Success Criteria</h3>
                  <Button 
                    type="button" 
                    onClick={addCriterion} 
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Criterion
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {form.watch("success_criteria").map((_, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Success Criterion {index + 1}</h4>
                          <Button
                            type="button"
                            onClick={() => removeCriterion(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            disabled={form.watch("success_criteria").length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`success_criteria.${index}.criterion`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-3">
                                <FormLabel>Success Criterion</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., User Adoption" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`success_criteria.${index}.metric`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Metric</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Active Users" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`success_criteria.${index}.target`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Target</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 100 weekly active users within 30 days of launch" {...field} />
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
                {form.formState.errors.success_criteria && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.success_criteria.message}
                  </p>
                )}
              </div>

              {/* Help Section */}
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Rocket className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">MVP Best Practices</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>A well-defined MVP helps you:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Focus on the core functionality that solves your users' primary problems</li>
                        <li>Get to market quickly and start gathering real user feedback</li>
                        <li>Test your core assumptions with minimal investment</li>
                        <li>Provide clear direction for your development team</li>
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
          Previous: Revenue Model
        </Button>
        <Button
          type="button"
          onClick={handleSaveAndComplete}
          disabled={saveMvpMutation.isPending}
        >
          {saveMvpMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Complete Startup Plan
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </MainLayout>
  );
}
