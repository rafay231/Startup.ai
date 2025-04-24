import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  DEMOGRAPHICS_AGE_RANGES, 
  DEMOGRAPHICS_INCOME_LEVELS, 
  DEMOGRAPHICS_EDUCATION_LEVELS,
  PURCHASE_CHANNELS,
  BUDGET_RANGES,
  PURCHASE_FREQUENCIES
} from "@/lib/constants";
import { TargetAudience, Startup } from "@shared/schema";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown,
  Info,
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
import { Input } from "@/components/ui/input";
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
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/layouts/MainLayout";
import ProgressTracker from "@/components/ProgressTracker";

// Schema for form validation
const audienceSchema = z.object({
  demographics: z.object({
    ageRange: z.string().min(1, "Please select an age range"),
    genders: z.array(z.string()).min(1, "Please select at least one gender"),
    incomeLevel: z.string().min(1, "Please select an income level"),
    educationLevel: z.string().min(1, "Please select an education level"),
    location: z.string().min(1, "Please enter a location"),
    occupation: z.string().min(1, "Please enter an occupation"),
  }),
  psychographics: z.object({
    interests: z.array(z.string()).min(1, "Please add at least one interest"),
    values: z.array(z.string()).min(1, "Please add at least one value"),
    goals: z.string().min(10, "Goals must be at least 10 characters"),
    painPoints: z.string().min(10, "Pain points must be at least 10 characters"),
  }),
  buyingBehavior: z.object({
    purchaseChannels: z.array(z.string()).min(1, "Please select at least one purchase channel"),
    decisionFactors: z.array(z.string()).min(1, "Please select at least one decision factor"),
    budgetRange: z.string().min(1, "Please select a budget range"),
    purchaseFrequency: z.string().min(1, "Please select a purchase frequency"),
  }),
  summary: z.string().optional(),
});

type AudienceFormValues = z.infer<typeof audienceSchema>;

export default function AudienceWizard() {
  const { startupId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const parsedStartupId = parseInt(startupId);
  
  // State for managing tags
  const [newInterest, setNewInterest] = useState("");
  const [newValue, setNewValue] = useState("");
  
  // Get startup details
  const { data: startup, isLoading: startupLoading } = useQuery<Startup>({
    queryKey: [`/api/startups/${startupId}`],
  });

  // Get existing audience data if available
  const { 
    data: existingAudience, 
    isLoading: audienceLoading,
    isError: audienceError
  } = useQuery<TargetAudience>({
    queryKey: [`/api/startups/${startupId}/audience`],
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no audience exists yet)
      if (error.message.includes("404")) return false;
      return failureCount < 3;
    },
  });

  // Decision factors options
  const decisionFactors = [
    { id: "price", label: "Price" },
    { id: "quality", label: "Quality" },
    { id: "convenience", label: "Convenience" },
    { id: "brand", label: "Brand reputation" }
  ];

  // Gender options
  const genderOptions = [
    { id: "male", label: "Male" },
    { id: "female", label: "Female" },
    { id: "other", label: "Other" }
  ];

  // Default form values
  const defaultFormValues: AudienceFormValues = {
    demographics: {
      ageRange: "",
      genders: [],
      incomeLevel: "",
      educationLevel: "",
      location: "",
      occupation: "",
    },
    psychographics: {
      interests: [],
      values: [],
      goals: "",
      painPoints: "",
    },
    buyingBehavior: {
      purchaseChannels: [],
      decisionFactors: [],
      budgetRange: "",
      purchaseFrequency: "",
    },
    summary: "",
  };

  const form = useForm<AudienceFormValues>({
    resolver: zodResolver(audienceSchema),
    defaultValues: defaultFormValues,
  });

  // Fill form with existing data when loaded
  useEffect(() => {
    if (existingAudience) {
      // Need to handle conversion from JSON to our form format
      const demographics = existingAudience.demographics as any;
      const psychographics = existingAudience.psychographics as any;
      const buyingBehavior = existingAudience.buyingBehavior as any;
      
      form.reset({
        demographics: {
          ageRange: demographics.ageRange || "",
          genders: demographics.genders || [],
          incomeLevel: demographics.incomeLevel || "",
          educationLevel: demographics.educationLevel || "",
          location: demographics.location || "",
          occupation: demographics.occupation || "",
        },
        psychographics: {
          interests: psychographics.interests || [],
          values: psychographics.values || [],
          goals: psychographics.goals || "",
          painPoints: psychographics.painPoints || "",
        },
        buyingBehavior: {
          purchaseChannels: buyingBehavior.purchaseChannels || [],
          decisionFactors: buyingBehavior.decisionFactors || [],
          budgetRange: buyingBehavior.budgetRange || "",
          purchaseFrequency: buyingBehavior.purchaseFrequency || "",
        },
        summary: existingAudience.summary || "",
      });
    }
  }, [existingAudience, form]);

  const saveAudienceMutation = useMutation({
    mutationFn: async (data: AudienceFormValues) => {
      const res = await apiRequest("POST", `/api/startups/${startupId}/audience`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Target audience saved",
        description: "Your target audience profile has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}/audience`] });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save target audience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AudienceFormValues) => {
    saveAudienceMutation.mutate(data);
  };

  const handleSaveAndContinue = async () => {
    if (form.formState.isValid) {
      const values = form.getValues();
      await saveAudienceMutation.mutateAsync(values);
      navigate(`/startups/${startupId}/business-model`);
    } else {
      form.trigger();
    }
  };

  const handleBack = () => {
    navigate(`/startups/${startupId}/idea`);
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      const currentInterests = form.getValues("psychographics.interests");
      if (!currentInterests.includes(newInterest.trim())) {
        form.setValue("psychographics.interests", [...currentInterests, newInterest.trim()]);
      }
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    const currentInterests = form.getValues("psychographics.interests");
    form.setValue(
      "psychographics.interests",
      currentInterests.filter(i => i !== interest)
    );
  };

  const addValue = () => {
    if (newValue.trim()) {
      const currentValues = form.getValues("psychographics.values");
      if (!currentValues.includes(newValue.trim())) {
        form.setValue("psychographics.values", [...currentValues, newValue.trim()]);
      }
      setNewValue("");
    }
  };

  const removeValue = (value: string) => {
    const currentValues = form.getValues("psychographics.values");
    form.setValue(
      "psychographics.values",
      currentValues.filter(v => v !== value)
    );
  };

  const regenerateSummary = () => {
    // In a real app, this would call an AI service to generate a summary
    // For now, we'll just set a placeholder summary
    const formData = form.getValues();
    const summary = `Based on your inputs, your target audience appears to be ${formData.demographics.occupation} aged ${formData.demographics.ageRange} with ${formData.demographics.educationLevel}, earning ${formData.demographics.incomeLevel} annually, living in ${formData.demographics.location}. They value ${formData.psychographics.values.join(", ")}, are motivated by ${formData.psychographics.goals}, and face challenges with ${formData.psychographics.painPoints}. They prefer ${formData.buyingBehavior.purchaseChannels.join(", ")} purchases, are ${formData.buyingBehavior.budgetRange}, and make ${formData.buyingBehavior.purchaseFrequency} purchases.`;
    
    form.setValue("summary", summary);
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
          disabled={saveAudienceMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Progress
        </Button>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker currentStep="audience" startupId={parsedStartupId} />

      {/* Audience Form */}
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h2 className="text-xl font-medium text-gray-900">Define Your Target Audience</h2>
              <p className="mt-1 text-sm text-gray-500">Create a detailed profile of your ideal customer to help focus your business strategy.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Demographics Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Demographics</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Age Range */}
                    <FormField
                      control={form.control}
                      name="demographics.ageRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Range</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select age range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DEMOGRAPHICS_AGE_RANGES.map((range) => (
                                <SelectItem key={range} value={range}>
                                  {range}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Gender */}
                    <FormField
                      control={form.control}
                      name="demographics.genders"
                      render={() => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <div className="mt-2 space-y-2">
                            {genderOptions.map((gender) => (
                              <div key={gender.id} className="flex items-center">
                                <FormField
                                  control={form.control}
                                  name="demographics.genders"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value.includes(gender.id)}
                                          onCheckedChange={(checked) => {
                                            const updatedValue = checked
                                              ? [...field.value, gender.id]
                                              : field.value.filter((val) => val !== gender.id);
                                            field.onChange(updatedValue);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {gender.label}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Income Level */}
                    <FormField
                      control={form.control}
                      name="demographics.incomeLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Income Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select income level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DEMOGRAPHICS_INCOME_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Education */}
                    <FormField
                      control={form.control}
                      name="demographics.educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select education level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DEMOGRAPHICS_EDUCATION_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Location */}
                    <FormField
                      control={form.control}
                      name="demographics.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Urban areas, North America" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Occupation */}
                    <FormField
                      control={form.control}
                      name="demographics.occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input placeholder="Business professionals" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Psychographics Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Psychographics</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Interests */}
                    <FormField
                      control={form.control}
                      name="psychographics.interests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interests</FormLabel>
                          <div className="mt-1">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {field.value.map((interest) => (
                                <Badge key={interest} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                  {interest}
                                  <button 
                                    type="button" 
                                    className="ml-1 inline-flex text-blue-600 focus:outline-none"
                                    onClick={() => removeInterest(interest)}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                placeholder="Add interest..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addInterest();
                                  }
                                }}
                              />
                              <Button type="button" size="sm" onClick={addInterest}>Add</Button>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Values */}
                    <FormField
                      control={form.control}
                      name="psychographics.values"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Values</FormLabel>
                          <div className="mt-1">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {field.value.map((value) => (
                                <Badge key={value} className="bg-green-100 text-green-800 hover:bg-green-200">
                                  {value}
                                  <button 
                                    type="button" 
                                    className="ml-1 inline-flex text-green-600 focus:outline-none"
                                    onClick={() => removeValue(value)}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder="Add value..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addValue();
                                  }
                                }}
                              />
                              <Button type="button" size="sm" onClick={addValue}>Add</Button>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Goals */}
                    <FormField
                      control={form.control}
                      name="psychographics.goals"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Goals and Motivations</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Seeking professional advancement, improving productivity, solving business challenges, and staying competitive in their industry."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Pain Points */}
                    <FormField
                      control={form.control}
                      name="psychographics.painPoints"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Pain Points and Challenges</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Time constraints, information overload, difficulty keeping up with industry changes, coordination challenges with teams, and balancing multiple responsibilities."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Buying Behavior Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Buying Behavior</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Purchase Channels */}
                    <FormField
                      control={form.control}
                      name="buyingBehavior.purchaseChannels"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Purchase Channels</FormLabel>
                          <div className="mt-2 space-y-2">
                            {PURCHASE_CHANNELS.map((channel) => (
                              <div key={channel} className="flex items-center">
                                <FormField
                                  control={form.control}
                                  name="buyingBehavior.purchaseChannels"
                                  render={({ field: innerField }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={innerField.value.includes(channel)}
                                          onCheckedChange={(checked) => {
                                            const updatedValue = checked
                                              ? [...innerField.value, channel]
                                              : innerField.value.filter((val) => val !== channel);
                                            innerField.onChange(updatedValue);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {channel}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Decision Factors */}
                    <FormField
                      control={form.control}
                      name="buyingBehavior.decisionFactors"
                      render={() => (
                        <FormItem>
                          <FormLabel>Key Decision Factors</FormLabel>
                          <div className="mt-2 space-y-2">
                            {decisionFactors.map((factor) => (
                              <div key={factor.id} className="flex items-center">
                                <FormField
                                  control={form.control}
                                  name="buyingBehavior.decisionFactors"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value.includes(factor.id)}
                                          onCheckedChange={(checked) => {
                                            const updatedValue = checked
                                              ? [...field.value, factor.id]
                                              : field.value.filter((val) => val !== factor.id);
                                            field.onChange(updatedValue);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {factor.label}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Budget Range */}
                    <FormField
                      control={form.control}
                      name="buyingBehavior.budgetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Range</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BUDGET_RANGES.map((range) => (
                                <SelectItem key={range} value={range}>
                                  {range}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Purchase Frequency */}
                    <FormField
                      control={form.control}
                      name="buyingBehavior.purchaseFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Frequency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select purchase frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PURCHASE_FREQUENCIES.map((frequency) => (
                                <SelectItem key={frequency} value={frequency}>
                                  {frequency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Audience Overview Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Audience Summary</h3>
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            className="mt-2 bg-white text-sm text-blue-700 border-blue-200"
                            placeholder="Based on your inputs, your target audience profile will appear here. Click 'Generate Summary' to create it."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="mt-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="text-blue-700 border-blue-300"
                      onClick={regenerateSummary}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> 
                      Generate Summary
                    </Button>
                  </div>
                </div>
                
                {/* AI Suggestions */}
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
                    AI Recommendations
                  </h3>
                  <div className="text-sm text-purple-700 space-y-2">
                    <p><strong>Marketing Channels:</strong> Consider LinkedIn advertising, industry-specific webinars, and productivity-focused content marketing.</p>
                    <p><strong>Messaging Focus:</strong> Emphasize time-saving benefits, professional advancement opportunities, and streamlined workflows.</p>
                    <p><strong>Pricing Strategy:</strong> Subscription-based model with tiered pricing would align with their monthly purchase preference and value orientation.</p>
                  </div>
                  <div className="mt-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="text-purple-700 border-purple-300"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" /> 
                      This is helpful
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="ml-2 text-purple-700 border-purple-300"
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" /> 
                      Not relevant
                    </Button>
                  </div>
                </div>
                
                {/* Help Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-800">Why is this important?</h3>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>A well-defined target audience helps you:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Craft more effective marketing messages</li>
                          <li>Design products that better meet customer needs</li>
                          <li>Focus your resources on the most promising market segments</li>
                          <li>Build a stronger competitive advantage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
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
          Previous: Startup Idea
        </Button>
        <Button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={saveAudienceMutation.isPending}
        >
          {saveAudienceMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next: Business Model
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </MainLayout>
  );
}
