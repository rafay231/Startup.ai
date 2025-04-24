import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BUSINESS_MODELS } from "@/lib/constants";
import { BusinessModel, Startup } from "@shared/schema";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  AlertCircle, 
  Loader2,
  X
} from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import MainLayout from "@/layouts/MainLayout";
import ProgressTracker from "@/components/ProgressTracker";

// Schema for form validation
const businessModelSchema = z.object({
  modelType: z.string().min(1, "Please select a business model type"),
  keyResources: z.array(z.string()).min(1, "Add at least one key resource"),
  keyActivities: z.array(z.string()).min(1, "Add at least one key activity"),
  valueProposition: z.string().min(10, "Value proposition must be at least 10 characters"),
  customerRelationships: z.string().min(10, "Customer relationships must be at least 10 characters"),
  channels: z.array(z.string()).min(1, "Add at least one channel"),
  costStructure: z.array(z.object({
    item: z.string().min(1, "Cost item cannot be empty"),
    description: z.string().optional()
  })).min(1, "Add at least one cost item"),
});

type BusinessModelFormValues = z.infer<typeof businessModelSchema>;

export default function BusinessModelWizard() {
  const { startupId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const parsedStartupId = parseInt(startupId);
  
  // State for managing array inputs
  const [newResource, setNewResource] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [newChannel, setNewChannel] = useState("");
  const [newCostItem, setNewCostItem] = useState("");
  const [newCostDescription, setNewCostDescription] = useState("");
  
  // Get startup details
  const { data: startup, isLoading: startupLoading } = useQuery<Startup>({
    queryKey: [`/api/startups/${startupId}`],
  });

  // Get existing business model if available
  const { 
    data: existingModel, 
    isLoading: modelLoading,
    isError: modelError
  } = useQuery<BusinessModel>({
    queryKey: [`/api/startups/${startupId}/business-model`],
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no model exists yet)
      if (error.message.includes("404")) return false;
      return failureCount < 3;
    },
  });

  // Default form values
  const defaultFormValues: BusinessModelFormValues = {
    modelType: "",
    keyResources: [],
    keyActivities: [],
    valueProposition: "",
    customerRelationships: "",
    channels: [],
    costStructure: [],
  };

  const form = useForm<BusinessModelFormValues>({
    resolver: zodResolver(businessModelSchema),
    defaultValues: defaultFormValues,
  });

  // Fill form with existing data when loaded
  useEffect(() => {
    if (existingModel) {
      // Cast JSON data to our form types
      const keyResources = existingModel.keyResources as string[] || [];
      const keyActivities = existingModel.keyActivities as string[] || [];
      const channels = existingModel.channels as string[] || [];
      const costStructure = existingModel.costStructure as { item: string, description?: string }[] || [];
      
      form.reset({
        modelType: existingModel.modelType || "",
        keyResources,
        keyActivities,
        valueProposition: existingModel.valueProposition || "",
        customerRelationships: existingModel.customerRelationships || "",
        channels,
        costStructure,
      });
    }
  }, [existingModel, form]);

  const saveBusinessModelMutation = useMutation({
    mutationFn: async (data: BusinessModelFormValues) => {
      const res = await apiRequest("POST", `/api/startups/${startupId}/business-model`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Business model saved",
        description: "Your business model has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}/business-model`] });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save business model",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BusinessModelFormValues) => {
    saveBusinessModelMutation.mutate(data);
  };

  const handleSaveAndContinue = async () => {
    if (form.formState.isValid) {
      const values = form.getValues();
      await saveBusinessModelMutation.mutateAsync(values);
      navigate(`/startups/${startupId}/competition`);
    } else {
      form.trigger();
    }
  };

  const handleBack = () => {
    navigate(`/startups/${startupId}/audience`);
  };

  // Handlers for array inputs
  const addResource = () => {
    if (newResource.trim()) {
      const currentResources = form.getValues("keyResources");
      if (!currentResources.includes(newResource.trim())) {
        form.setValue("keyResources", [...currentResources, newResource.trim()]);
      }
      setNewResource("");
    }
  };

  const removeResource = (resource: string) => {
    const currentResources = form.getValues("keyResources");
    form.setValue(
      "keyResources",
      currentResources.filter(r => r !== resource)
    );
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      const currentActivities = form.getValues("keyActivities");
      if (!currentActivities.includes(newActivity.trim())) {
        form.setValue("keyActivities", [...currentActivities, newActivity.trim()]);
      }
      setNewActivity("");
    }
  };

  const removeActivity = (activity: string) => {
    const currentActivities = form.getValues("keyActivities");
    form.setValue(
      "keyActivities",
      currentActivities.filter(a => a !== activity)
    );
  };

  const addChannel = () => {
    if (newChannel.trim()) {
      const currentChannels = form.getValues("channels");
      if (!currentChannels.includes(newChannel.trim())) {
        form.setValue("channels", [...currentChannels, newChannel.trim()]);
      }
      setNewChannel("");
    }
  };

  const removeChannel = (channel: string) => {
    const currentChannels = form.getValues("channels");
    form.setValue(
      "channels",
      currentChannels.filter(c => c !== channel)
    );
  };

  const addCostItem = () => {
    if (newCostItem.trim()) {
      const currentCosts = form.getValues("costStructure");
      form.setValue("costStructure", [
        ...currentCosts, 
        { 
          item: newCostItem.trim(), 
          description: newCostDescription.trim() || undefined 
        }
      ]);
      setNewCostItem("");
      setNewCostDescription("");
    }
  };

  const removeCostItem = (index: number) => {
    const currentCosts = form.getValues("costStructure");
    form.setValue(
      "costStructure",
      currentCosts.filter((_, i) => i !== index)
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
          disabled={saveBusinessModelMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Progress
        </Button>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker currentStep="businessModel" startupId={parsedStartupId} />

      {/* Business Model Form */}
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-900">Define Your Business Model</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Outline how your business will create, deliver, and capture value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Business Model Type */}
              <FormField
                control={form.control}
                name="modelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Model Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a business model type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUSINESS_MODELS.map((model) => (
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

              {/* Value Proposition */}
              <FormField
                control={form.control}
                name="valueProposition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value Proposition</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What unique value does your product/service provide to customers?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Key Resources */}
              <FormField
                control={form.control}
                name="keyResources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Resources</FormLabel>
                    <div className="mt-1">
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
                          placeholder="Add resource (e.g., Technology, People, Intellectual Property)"
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

              {/* Key Activities */}
              <FormField
                control={form.control}
                name="keyActivities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Activities</FormLabel>
                    <div className="mt-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {field.value.map((activity) => (
                          <Badge key={activity} className="bg-green-100 text-green-800 hover:bg-green-200">
                            {activity}
                            <button 
                              type="button" 
                              className="ml-1 inline-flex text-green-600 focus:outline-none"
                              onClick={() => removeActivity(activity)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newActivity}
                          onChange={(e) => setNewActivity(e.target.value)}
                          placeholder="Add activity (e.g., Product Development, Marketing, Customer Support)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addActivity();
                            }
                          }}
                        />
                        <Button type="button" size="sm" onClick={addActivity}>Add</Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Customer Relationships */}
              <FormField
                control={form.control}
                name="customerRelationships"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Relationships</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How will you acquire and retain customers? How will you interact with them?"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Channels */}
              <FormField
                control={form.control}
                name="channels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channels</FormLabel>
                    <div className="mt-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {field.value.map((channel) => (
                          <Badge key={channel} className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                            {channel}
                            <button 
                              type="button" 
                              className="ml-1 inline-flex text-purple-600 focus:outline-none"
                              onClick={() => removeChannel(channel)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newChannel}
                          onChange={(e) => setNewChannel(e.target.value)}
                          placeholder="Add channel (e.g., Website, Mobile App, Partners, Sales Team)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addChannel();
                            }
                          }}
                        />
                        <Button type="button" size="sm" onClick={addChannel}>Add</Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cost Structure */}
              <FormField
                control={form.control}
                name="costStructure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Structure</FormLabel>
                    <div className="mt-1 space-y-4">
                      <div className="border rounded-md overflow-hidden">
                        {field.value.length > 0 ? (
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Cost Item
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Description
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {field.value.map((cost, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {cost.item}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {cost.description || '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-red-600 hover:text-red-900"
                                      onClick={() => removeCostItem(index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No cost items added yet
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-5">
                          <Input
                            value={newCostItem}
                            onChange={(e) => setNewCostItem(e.target.value)}
                            placeholder="Cost item (e.g., Development, Marketing)"
                          />
                        </div>
                        <div className="col-span-5">
                          <Input
                            value={newCostDescription}
                            onChange={(e) => setNewCostDescription(e.target.value)}
                            placeholder="Description (optional)"
                          />
                        </div>
                        <div className="col-span-2">
                          <Button 
                            type="button" 
                            onClick={addCostItem}
                            className="w-full"
                            disabled={!newCostItem.trim()}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Help Section */}
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">Business Model Canvas Tips</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>A comprehensive business model helps you:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Visualize the entire structure of your business</li>
                        <li>Identify key dependencies and relationships</li>
                        <li>Focus on elements that create sustainable value</li>
                        <li>Communicate your business strategy to stakeholders</li>
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
          Previous: Target Audience
        </Button>
        <Button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={saveBusinessModelMutation.isPending}
        >
          {saveBusinessModelMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next: Competition
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </MainLayout>
  );
}
