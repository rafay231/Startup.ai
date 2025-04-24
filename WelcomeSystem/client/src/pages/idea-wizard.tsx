import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { INDUSTRIES } from "@/lib/constants";
import { StartupIdea, Startup } from "@shared/schema";
import { ArrowLeft, ArrowRight, Save, AlertCircle, Loader2 } from "lucide-react";
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
import MainLayout from "@/layouts/MainLayout";
import ProgressTracker from "@/components/ProgressTracker";

const ideaSchema = z.object({
  problemStatement: z.string().min(10, "Problem statement must be at least 10 characters"),
  solution: z.string().min(10, "Solution must be at least 10 characters"),
  uniqueValueProposition: z.string().min(10, "Unique value proposition must be at least 10 characters"),
  targetIndustry: z.string().min(1, "Please select a target industry"),
  targetMarketSize: z.string().optional(),
  challengesAndOpportunities: z.string().optional(),
});

type IdeaFormValues = z.infer<typeof ideaSchema>;

export default function IdeaWizard() {
  const { startupId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const parsedStartupId = parseInt(startupId);
  
  // Get startup details
  const { data: startup, isLoading: startupLoading } = useQuery<Startup>({
    queryKey: [`/api/startups/${startupId}`],
  });

  // Get existing idea data if available
  const { 
    data: existingIdea, 
    isLoading: ideaLoading,
    isError: ideaError,
    error: ideaFetchError
  } = useQuery<StartupIdea>({
    queryKey: [`/api/startups/${startupId}/idea`],
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no idea exists yet)
      if (error.message.includes("404")) return false;
      return failureCount < 3;
    },
  });

  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      problemStatement: "",
      solution: "",
      uniqueValueProposition: "",
      targetIndustry: "",
      targetMarketSize: "",
      challengesAndOpportunities: "",
    },
  });

  // Fill form with existing data when loaded
  useEffect(() => {
    if (existingIdea) {
      form.reset({
        problemStatement: existingIdea.problemStatement,
        solution: existingIdea.solution,
        uniqueValueProposition: existingIdea.uniqueValueProposition,
        targetIndustry: existingIdea.targetIndustry,
        targetMarketSize: existingIdea.targetMarketSize || "",
        challengesAndOpportunities: existingIdea.challengesAndOpportunities || "",
      });
    }
  }, [existingIdea, form]);

  const saveIdeaMutation = useMutation({
    mutationFn: async (data: IdeaFormValues) => {
      const res = await apiRequest("POST", `/api/startups/${startupId}/idea`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Idea saved",
        description: "Your startup idea has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}/idea`] });
      queryClient.invalidateQueries({ queryKey: [`/api/startups/${startupId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IdeaFormValues) => {
    saveIdeaMutation.mutate(data);
  };

  const handleSaveAndContinue = async () => {
    if (form.formState.isValid) {
      const values = form.getValues();
      await saveIdeaMutation.mutateAsync(values);
      navigate(`/startups/${startupId}/audience`);
    } else {
      form.trigger();
    }
  };

  const handleBack = () => {
    navigate("/");
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
          disabled={saveIdeaMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Progress
        </Button>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker currentStep="idea" startupId={parsedStartupId} />

      {/* Idea Form */}
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-900">Define Your Startup Idea</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Document the core elements of your startup idea to set a strong foundation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Problem Statement */}
              <FormField
                control={form.control}
                name="problemStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Statement</FormLabel>
                    <FormDescription>
                      Clearly define the problem your startup will solve
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the problem or pain point your target audience faces"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Solution */}
              <FormField
                control={form.control}
                name="solution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solution</FormLabel>
                    <FormDescription>
                      Describe how your product or service solves this problem
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Explain your solution and how it addresses the problem"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unique Value Proposition */}
              <FormField
                control={form.control}
                name="uniqueValueProposition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unique Value Proposition</FormLabel>
                    <FormDescription>
                      What makes your solution unique and better than alternatives?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Articulate what sets your solution apart from competitors"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Target Industry */}
                <FormField
                  control={form.control}
                  name="targetIndustry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Industry</FormLabel>
                      <FormDescription>
                        Which industry will you focus on?
                      </FormDescription>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Target Market Size */}
                <FormField
                  control={form.control}
                  name="targetMarketSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Market Size</FormLabel>
                      <FormDescription>
                        Estimate the size of your target market
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="e.g., $10B global market, 5M potential users"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Challenges and Opportunities */}
              <FormField
                control={form.control}
                name="challengesAndOpportunities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenges and Opportunities</FormLabel>
                    <FormDescription>
                      Identify potential challenges and growth opportunities
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="List key challenges you expect to face and opportunities for growth"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {/* Help Section */}
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">Why is this important?</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>A well-defined startup idea helps you:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Clearly communicate your vision to stakeholders</li>
                    <li>Identify and validate your market opportunity</li>
                    <li>Focus product development on solving real problems</li>
                    <li>Differentiate your solution from competitors</li>
                  </ul>
                </div>
              </div>
            </div>
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
          Back to Dashboard
        </Button>
        <Button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={saveIdeaMutation.isPending}
        >
          {saveIdeaMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next: Target Audience
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </MainLayout>
  );
}
