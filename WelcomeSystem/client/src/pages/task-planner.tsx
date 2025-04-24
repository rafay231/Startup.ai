import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task, Startup } from "@shared/schema";
import { format } from "date-fns";
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from "@/lib/constants";
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Loader2, 
  CheckSquare, 
  ClipboardList, 
  BarChart,
  AlertCircle,
  Clock,
  Filter,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const taskSchema = z.object({
  startupId: z.number(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function TaskPlanner() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [selectedStartupId, setSelectedStartupId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  
  // Get user's startups
  const { data: startups, isLoading: startupsLoading } = useQuery<Startup[]>({
    queryKey: ["/api/startups"],
  });

  // Get tasks for selected startup
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/startups", selectedStartupId, "tasks"],
    queryFn: async () => {
      if (!selectedStartupId) return [];
      const res = await fetch(`/api/startups/${selectedStartupId}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    enabled: !!selectedStartupId,
  });

  // Get all tasks across startups when no specific startup is selected
  const { data: allTasks, isLoading: allTasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/all"],
    queryFn: async () => {
      // Fetch tasks for each startup and combine them
      if (!startups) return [];
      const allTasksPromises = startups.map(async (startup) => {
        try {
          const res = await fetch(`/api/startups/${startup.id}/tasks`);
          if (!res.ok) return [];
          const tasks = await res.json();
          return tasks;
        } catch (error) {
          return [];
        }
      });
      
      const results = await Promise.all(allTasksPromises);
      return results.flat();
    },
    enabled: !!startups,
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      startupId: selectedStartupId || 0,
    },
  });

  // Reset form when editing task changes
  useState(() => {
    if (editTask) {
      form.reset({
        startupId: editTask.startupId,
        title: editTask.title,
        description: editTask.description || "",
        dueDate: editTask.dueDate ? new Date(editTask.dueDate) : undefined,
        status: editTask.status,
        priority: editTask.priority,
      });
    } else {
      form.reset({
        startupId: selectedStartupId || (startups && startups[0]?.id) || 0,
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: undefined,
      });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const res = await apiRequest("POST", `/api/startups/${data.startupId}/tasks`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
      setCreateDialogOpen(false);
      form.reset();
      invalidateTaskQueries();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues & { id: number }) => {
      const { id, ...taskData } = data;
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, taskData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
      setCreateDialogOpen(false);
      setEditTask(null);
      form.reset();
      invalidateTaskQueries();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      invalidateTaskQueries();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const invalidateTaskQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/startups", selectedStartupId, "tasks"] });
    queryClient.invalidateQueries({ queryKey: ["/api/tasks/all"] });
  };

  const onSubmit = (data: TaskFormValues) => {
    if (editTask) {
      updateTaskMutation.mutate({ ...data, id: editTask.id });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setCreateDialogOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await apiRequest("PATCH", `/api/tasks/${taskId}`, { status: newStatus });
      invalidateTaskQueries();
      toast({
        title: "Status updated",
        description: `Task status changed to ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Filter tasks based on selected tab
  const getFilteredTasks = () => {
    const tasksToFilter = selectedStartupId ? tasks : allTasks;
    
    if (!tasksToFilter) return [];
    
    if (selectedTab === "all") return tasksToFilter;
    
    return tasksToFilter.filter(task => task.status === selectedTab);
  };

  const filteredTasks = getFilteredTasks();

  // Get task counts for status tabs
  const getTaskCounts = () => {
    const tasksToCount = selectedStartupId ? tasks : allTasks;
    
    if (!tasksToCount) return { all: 0, pending: 0, "in-progress": 0, completed: 0, blocked: 0 };
    
    return {
      all: tasksToCount.length,
      pending: tasksToCount.filter(t => t.status === "pending").length,
      "in-progress": tasksToCount.filter(t => t.status === "in-progress").length,
      completed: tasksToCount.filter(t => t.status === "completed").length,
      blocked: tasksToCount.filter(t => t.status === "blocked").length,
    };
  };

  const taskCounts = getTaskCounts();

  // Color mapping for statuses and priorities
  const statusColorMap: Record<string, string> = {
    "pending": "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    "completed": "bg-green-100 text-green-800",
    "blocked": "bg-red-100 text-red-800",
  };

  const priorityColorMap: Record<string, string> = {
    "low": "bg-gray-100 text-gray-800",
    "medium": "bg-blue-100 text-blue-800",
    "high": "bg-orange-100 text-orange-800",
    "urgent": "bg-red-100 text-red-800",
  };

  // Get startup name by ID
  const getStartupName = (startupId: number) => {
    const startup = startups?.find(s => s.id === startupId);
    return startup?.name || "Unknown Startup";
  };

  const isLoading = startupsLoading || (selectedStartupId ? tasksLoading : allTasksLoading);

  return (
    <MainLayout title="Task Planner" subtitle="Organize and track your startup tasks">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Task Management</CardTitle>
              <CardDescription>Organize tasks by startup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start"
                variant={selectedStartupId === null ? "default" : "ghost"}
                onClick={() => setSelectedStartupId(null)}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                All Tasks
              </Button>
              <Separator />
              {startupsLoading ? (
                <div className="py-4 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : startups?.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">
                  No startups found
                </div>
              ) : (
                <div className="space-y-1">
                  {startups?.map((startup) => (
                    <Button
                      key={startup.id}
                      className="w-full justify-start"
                      variant={selectedStartupId === startup.id ? "default" : "ghost"}
                      onClick={() => setSelectedStartupId(startup.id)}
                    >
                      {startup.name}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => {
                  setEditTask(null);
                  form.reset({
                    startupId: selectedStartupId || (startups && startups[0]?.id) || 0,
                    title: "",
                    description: "",
                    status: "pending",
                    priority: "medium",
                  });
                  setCreateDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Task
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Task Stats</CardTitle>
              <CardDescription>Track your progress</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-4 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-100 p-3 rounded">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="text-2xl font-bold">{taskCounts.all}</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <div className="text-sm text-yellow-600">Pending</div>
                      <div className="text-2xl font-bold">{taskCounts.pending}</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-sm text-blue-600">In Progress</div>
                      <div className="text-2xl font-bold">{taskCounts["in-progress"]}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-sm text-green-600">Completed</div>
                      <div className="text-2xl font-bold">{taskCounts.completed}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Completion Rate</div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ 
                          width: taskCounts.all > 0 
                            ? `${(taskCounts.completed / taskCounts.all) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      {taskCounts.all > 0 
                        ? `${Math.round((taskCounts.completed / taskCounts.all) * 100)}%` 
                        : '0%'
                      }
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {selectedStartupId 
                ? `Tasks for ${getStartupName(selectedStartupId)}` 
                : "All Tasks"
              }
            </h2>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editTask ? "Edit Task" : "Create New Task"}</DialogTitle>
                  <DialogDescription>
                    {editTask 
                      ? "Update the details of your existing task." 
                      : "Enter the details for your new task."
                    }
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Startup Selection */}
                    <FormField
                      control={form.control}
                      name="startupId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Startup</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select startup" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {startups?.map((startup) => (
                                <SelectItem key={startup.id} value={startup.id.toString()}>
                                  {startup.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Task Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter task title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Task Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter task description (optional)"
                              {...field}
                              value={field.value || ""}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Due Date */}
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Status */}
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TASK_STATUS_OPTIONS.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Priority */}
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TASK_PRIORITY_OPTIONS.map((priority) => (
                                  <SelectItem key={priority} value={priority}>
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
                      <Button 
                        type="submit" 
                        disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                      >
                        {(createTaskMutation.isPending || updateTaskMutation.isPending) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editTask ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          editTask ? "Update Task" : "Create Task"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">
                All
                <Badge variant="outline" className="ml-2">{taskCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <Badge variant="outline" className="ml-2">{taskCounts.pending}</Badge>
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress
                <Badge variant="outline" className="ml-2">{taskCounts["in-progress"]}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge variant="outline" className="ml-2">{taskCounts.completed}</Badge>
              </TabsTrigger>
              <TabsTrigger value="blocked">
                Blocked
                <Badge variant="outline" className="ml-2">{taskCounts.blocked}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab} className="mt-0">
              {isLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </CardContent>
                </Card>
              ) : filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckSquare className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">No tasks found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedTab === "all" 
                        ? "Create your first task to get started"
                        : `No tasks with ${selectedTab} status`
                      }
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setEditTask(null);
                        form.reset({
                          startupId: selectedStartupId || (startups && startups[0]?.id) || 0,
                          title: "",
                          description: "",
                          status: "pending",
                          priority: "medium",
                        });
                        setCreateDialogOpen(true);
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Task
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex items-start p-4">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium text-lg">{task.title}</h3>
                              <div className="flex ml-2 gap-2">
                                <Badge className={statusColorMap[task.status]}>
                                  {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace("-", " ")}
                                </Badge>
                                <Badge className={priorityColorMap[task.priority]}>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            
                            {!selectedStartupId && (
                              <p className="text-sm text-gray-500 mt-1">
                                <span className="font-medium">Project:</span> {getStartupName(task.startupId)}
                              </p>
                            )}
                            
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                            )}
                            
                            {task.dueDate && (
                              <div className="flex items-center mt-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Select 
                              defaultValue={task.status}
                              onValueChange={(value) => handleStatusChange(task.id, value)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Change status" />
                              </SelectTrigger>
                              <SelectContent>
                                {TASK_STATUS_OPTIONS.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTask(task)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-gray-500"
                              >
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                              </svg>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
