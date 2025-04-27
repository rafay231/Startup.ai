import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Startup } from "@shared/schema";
import { INDUSTRIES, BUSINESS_STAGES } from "@/lib/constants";
import { PlusCircle, ArrowRight, Lightbulb, LineChart, Clock, Loader2, MessageSquare, Map, BarChart, FileText, Briefcase, Megaphone, Palette } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Define the NewFeatures component
interface NewFeaturesProps {
  hasStartups: boolean;
  startupId?: number;
}

function NewFeatures({ hasStartups, startupId }: NewFeaturesProps) {
  const features = [
    {
      title: "Roadmap Planning",
      description: "Create a strategic roadmap for your startup's journey",
      icon: Map,
      href: startupId ? `/startups/${startupId}/roadmap` : "/",
      disabled: !hasStartups
    },
    {
      title: "Community Forum",
      description: "Connect with other founders and share insights",
      icon: MessageSquare,
      href: "/forum",
      disabled: false
    },
    {
      title: "Funding Strategy",
      description: "Develop a comprehensive funding strategy",
      icon: BarChart,
      href: startupId ? `/startups/${startupId}/funding` : "/",
      disabled: !hasStartups
    },
    {
      title: "Legal Pack",
      description: "Access essential legal documents for your startup",
      icon: FileText,
      href: startupId ? `/startups/${startupId}/legal` : "/",
      disabled: !hasStartups
    },
    {
      title: "Marketing Plan",
      description: "Create a marketing strategy to reach your audience",
      icon: Megaphone,
      href: startupId ? `/startups/${startupId}/marketing` : "/",
      disabled: !hasStartups
    },
    {
      title: "Branding Kit",
      description: "Design a professional brand identity",
      icon: Palette,
      href: startupId ? `/startups/${startupId}/branding` : "/",
      disabled: !hasStartups
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">AI-Powered Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className={feature.disabled ? "opacity-70" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <feature.icon className="h-8 w-8 text-primary" />
                {feature.disabled && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    Create a startup first
                  </span>
                )}
              </div>
              <CardTitle className="text-lg mt-2">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                disabled={feature.disabled}
                onClick={() => window.location.href = feature.href}
              >
                Explore <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

const createStartupSchema = z.object({
  name: z.string().min(3, "Startup name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  industry: z.string().min(1, "Please select an industry"),
  stage: z.string().min(1, "Please select a stage"),
});

type CreateStartupValues = z.infer<typeof createStartupSchema>;

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const form = useForm<CreateStartupValues>({
    resolver: zodResolver(createStartupSchema),
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      stage: "",
    },
  });

  const { data: startups, isLoading } = useQuery<Startup[]>({
    queryKey: ["/api/startups"],
  });

  const createStartupMutation = useMutation({
    mutationFn: async (data: CreateStartupValues) => {
      const res = await apiRequest("POST", "/api/startups", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Startup created",
        description: "Your startup has been created successfully.",
      });
      setCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/startups"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create startup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateStartupValues) => {
    createStartupMutation.mutate(data);
  };

  const handleStartupClick = (startupId: number) => {
    navigate(`/startups/${startupId}/idea`);
  };

  const hasStartups = startups && startups.length > 0;

  return (
    <MainLayout title="Dashboard" subtitle="Overview of your startup projects">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Startups</CardTitle>
            <CardDescription>Number of startup projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "-" : startups?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Progress</CardTitle>
            <CardDescription>Completion rate across projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "-" : startups?.length 
                ? `${Math.round(startups.reduce((acc, startup) => acc + startup.progress, 0) / startups.length)}%` 
                : "0%"
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Latest Activity</CardTitle>
            <CardDescription>Most recent updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : hasStartups ? (
                <>Last update: {new Date(startups[0].updatedAt).toLocaleDateString()}</>
              ) : (
                "No activity yet"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <NewFeatures 
        hasStartups={hasStartups} 
        startupId={startups && startups.length > 0 ? startups[0].id : undefined} 
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Startups</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Startup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Startup</DialogTitle>
              <DialogDescription>
                Enter the basic information to get started with your new startup idea.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Startup Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter startup name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Briefly describe your startup idea" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
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
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BUSINESS_STAGES.map((stage) => (
                              <SelectItem key={stage} value={stage}>
                                {stage}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createStartupMutation.isPending}>
                    {createStartupMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Startup"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !hasStartups ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-3 text-lg font-semibold">No startups yet</h3>
            <p className="mb-6 text-sm text-gray-500">
              Create your first startup to begin the process of transforming your idea into reality.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Startup
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {startups.map((startup) => (
            <Card key={startup.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{startup.name}</CardTitle>
                    <CardDescription className="mt-1">{startup.industry}</CardDescription>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {startup.stage}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{startup.description}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{startup.progress}%</span>
                  </div>
                  <Progress value={startup.progress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="mr-1 h-3 w-3" />
                  Created: {new Date(startup.createdAt).toLocaleDateString()}
                </div>
                <Button size="sm" variant="outline" onClick={() => handleStartupClick(startup.id)}>
                  Continue
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
