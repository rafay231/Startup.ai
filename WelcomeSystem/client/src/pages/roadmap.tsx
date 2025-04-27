import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

interface Roadmap {
  id: number;
  startupId: number;
  title: string;
  description: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: "planned" | "in-progress" | "completed" | "delayed";
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface Startup {
  id: number;
  name: string;
  description: string;
  industry: string;
  stage: string;
}

export default function RoadmapPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStartupId, setSelectedStartupId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [roadmapData, setRoadmapData] = useState<Partial<Roadmap> | null>(null);

  // Fetch user startups
  const { data: startups, isLoading: startupsLoading } = useQuery<Startup[]>({
    queryKey: ["/api/startups"],
  });

  // Set the first startup as selected by default
  useEffect(() => {
    if (startups && startups.length > 0 && !selectedStartupId) {
      setSelectedStartupId(startups[0].id);
    }
  }, [startups, selectedStartupId]);

  // Fetch roadmap for selected startup
  const { data: roadmap, isLoading: roadmapLoading } = useQuery<Roadmap>({
    queryKey: [selectedStartupId ? `/api/startup-features/roadmap/${selectedStartupId}` : null],
    enabled: !!selectedStartupId,
  });

  // Create or update roadmap
  const saveRoadmap = useMutation({
    mutationFn: async (data: Partial<Roadmap>) => {
      if (roadmap) {
        // Update existing roadmap
        return apiRequest("PUT", `/api/startup-features/roadmap/${roadmap.id}`, data);
      } else {
        // Create new roadmap
        return apiRequest("POST", `/api/startup-features/roadmap`, {
          ...data,
          startupId: selectedStartupId,
        });
      }
    },
    onSuccess: () => {
      if (selectedStartupId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/startup-features/roadmap/${selectedStartupId}`],
        });
      }
      setEditMode(false);
      toast({
        title: "Success",
        description: roadmap ? "Roadmap updated successfully" : "Roadmap created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save roadmap: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Update milestone status
  const updateMilestoneStatus = useMutation({
    mutationFn: async ({
      milestoneId,
      status,
    }: {
      milestoneId: string;
      status: Milestone["status"];
    }) => {
      return apiRequest("PUT", `/api/startup-features/roadmap/${roadmap?.id}/milestone/${milestoneId}`, {
        status,
      });
    },
    onSuccess: () => {
      if (selectedStartupId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/startup-features/roadmap/${selectedStartupId}`],
        });
      }
      toast({
        title: "Success",
        description: "Milestone status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update milestone status: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Toggle task completion
  const toggleTaskCompletion = useMutation({
    mutationFn: async ({
      milestoneId,
      taskId,
      completed,
    }: {
      milestoneId: string;
      taskId: string;
      completed: boolean;
    }) => {
      return apiRequest(
        "PUT",
        `/api/startup-features/roadmap/${roadmap?.id}/milestone/${milestoneId}/task/${taskId}`,
        { completed }
      );
    },
    onSuccess: () => {
      if (selectedStartupId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/startup-features/roadmap/${selectedStartupId}`],
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleStartupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const startupId = parseInt(e.target.value);
    setSelectedStartupId(startupId);
    setEditMode(false);
  };

  const handleEditClick = () => {
    setRoadmapData(roadmap || {
      title: "",
      description: "",
      milestones: [],
    });
    setEditMode(true);
  };

  const handleSaveRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (roadmapData) {
      saveRoadmap.mutate(roadmapData);
    }
  };

  const handleAddMilestone = () => {
    if (roadmapData) {
      const newMilestone: Milestone = {
        id: `milestone-${Date.now()}`,
        title: "New Milestone",
        description: "Describe this milestone",
        targetDate: new Date().toISOString().split("T")[0],
        status: "planned",
        tasks: [],
      };

      setRoadmapData({
        ...roadmapData,
        milestones: [...(roadmapData.milestones || []), newMilestone],
      });
    }
  };

  const handleAddTask = (milestoneIndex: number) => {
    if (roadmapData && roadmapData.milestones) {
      const updatedMilestones = [...roadmapData.milestones];
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: "New Task",
        completed: false,
      };

      updatedMilestones[milestoneIndex].tasks.push(newTask);
      setRoadmapData({
        ...roadmapData,
        milestones: updatedMilestones,
      });
    }
  };

  const handleRemoveMilestone = (index: number) => {
    if (roadmapData && roadmapData.milestones) {
      const updatedMilestones = [...roadmapData.milestones];
      updatedMilestones.splice(index, 1);
      setRoadmapData({
        ...roadmapData,
        milestones: updatedMilestones,
      });
    }
  };

  const handleRemoveTask = (milestoneIndex: number, taskIndex: number) => {
    if (roadmapData && roadmapData.milestones) {
      const updatedMilestones = [...roadmapData.milestones];
      updatedMilestones[milestoneIndex].tasks.splice(taskIndex, 1);
      setRoadmapData({
        ...roadmapData,
        milestones: updatedMilestones,
      });
    }
  };

  const getStatusColor = (status: Milestone["status"]) => {
    switch (status) {
      case "planned":
        return "bg-gray-200 text-gray-800";
      case "in-progress":
        return "bg-blue-200 text-blue-800";
      case "completed":
        return "bg-green-200 text-green-800";
      case "delayed":
        return "bg-yellow-200 text-yellow-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Startup Roadmap</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedStartupId || ""}
            onChange={handleStartupChange}
            className="p-2 border rounded-md"
            disabled={startupsLoading || editMode}
          >
            {startupsLoading ? (
              <option>Loading startups...</option>
            ) : startups && startups.length > 0 ? (
              startups.map((startup) => (
                <option key={startup.id} value={startup.id}>
                  {startup.name}
                </option>
              ))
            ) : (
              <option value="">No startups found</option>
            )}
          </select>
          {!editMode ? (
            <button
              onClick={handleEditClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={!selectedStartupId}
            >
              {roadmap ? "Edit Roadmap" : "Create Roadmap"}
            </button>
          ) : (
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {roadmapLoading && selectedStartupId && (
        <div className="text-center py-8">Loading roadmap data...</div>
      )}

      {/* No Startup Selected */}
      {!selectedStartupId && !startupsLoading && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4">No Startup Selected</h2>
          <p className="text-gray-600 mb-4">
            Please select a startup to view or create a roadmap.
          </p>
        </div>
      )}

      {/* Edit Mode */}
      {editMode && roadmapData && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {roadmap ? "Edit Roadmap" : "Create New Roadmap"}
          </h2>
          <form onSubmit={handleSaveRoadmap}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={roadmapData.title || ""}
                onChange={(e) => setRoadmapData({ ...roadmapData, title: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={roadmapData.description || ""}
                onChange={(e) => setRoadmapData({ ...roadmapData, description: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows={3}
                required
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Milestones</h3>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Add Milestone
                </button>
              </div>

              {roadmapData.milestones && roadmapData.milestones.length > 0 ? (
                <div className="space-y-6">
                  {roadmapData.milestones.map((milestone, milestoneIndex) => (
                    <div key={milestone.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => {
                              const updatedMilestones = [...(roadmapData.milestones || [])];
                              updatedMilestones[milestoneIndex].title = e.target.value;
                              setRoadmapData({
                                ...roadmapData,
                                milestones: updatedMilestones,
                              });
                            }}
                            className="w-full p-2 border rounded-md mb-2"
                            placeholder="Milestone Title"
                            required
                          />
                          <textarea
                            value={milestone.description}
                            onChange={(e) => {
                              const updatedMilestones = [...(roadmapData.milestones || [])];
                              updatedMilestones[milestoneIndex].description = e.target.value;
                              setRoadmapData({
                                ...roadmapData,
                                milestones: updatedMilestones,
                              });
                            }}
                            className="w-full p-2 border rounded-md mb-2"
                            placeholder="Milestone Description"
                            rows={2}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(milestoneIndex)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Target Date</label>
                          <input
                            type="date"
                            value={milestone.targetDate.split("T")[0]}
                            onChange={(e) => {
                              const updatedMilestones = [...(roadmapData.milestones || [])];
                              updatedMilestones[milestoneIndex].targetDate = e.target.value;
                              setRoadmapData({
                                ...roadmapData,
                                milestones: updatedMilestones,
                              });
                            }}
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Status</label>
                          <select
                            value={milestone.status}
                            onChange={(e) => {
                              const updatedMilestones = [...(roadmapData.milestones || [])];
                              updatedMilestones[milestoneIndex].status = e.target.value as Milestone["status"];
                              setRoadmapData({
                                ...roadmapData,
                                milestones: updatedMilestones,
                              });
                            }}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="planned">Planned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="delayed">Delayed</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-md font-medium">Tasks</h4>
                          <button
                            type="button"
                            onClick={() => handleAddTask(milestoneIndex)}
                            className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-md hover:bg-gray-300"
                          >
                            Add Task
                          </button>
                        </div>

                        {milestone.tasks.length > 0 ? (
                          <ul className="space-y-2">
                            {milestone.tasks.map((task, taskIndex) => (
                              <li key={task.id} className="flex items-center">
                                <input
                                  type="text"
                                  value={task.title}
                                  onChange={(e) => {
                                    const updatedMilestones = [...(roadmapData.milestones || [])];
                                    updatedMilestones[milestoneIndex].tasks[taskIndex].title = e.target.value;
                                    setRoadmapData({
                                      ...roadmapData,
                                      milestones: updatedMilestones,
                                    });
                                  }}
                                  className="flex-1 p-2 border rounded-md"
                                  placeholder="Task description"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTask(milestoneIndex, taskIndex)}
                                  className="ml-2 text-red-600 hover:text-red-800"
                                >
                                  ✕
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No tasks added yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border rounded-md bg-gray-50">
                  <p className="text-gray-500 mb-2">No milestones added yet</p>
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Add Your First Milestone
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={saveRoadmap.isPending}
              >
                {saveRoadmap.isPending
                  ? "Saving..."
                  : roadmap
                  ? "Update Roadmap"
                  : "Create Roadmap"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Mode */}
      {!editMode && roadmap && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold mb-2">{roadmap.title}</h2>
            <p className="text-gray-600">{roadmap.description}</p>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Milestones</h3>
            {roadmap.milestones && roadmap.milestones.length > 0 ? (
              <div className="space-y-8">
                {roadmap.milestones.map((milestone) => (
                  <div key={milestone.id} className="border rounded-lg p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-medium">{milestone.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-4">
                            Target: {new Date(milestone.targetDate).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                              milestone.status
                            )}`}
                          >
                            {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <select
                          value={milestone.status}
                          onChange={(e) =>
                            updateMilestoneStatus.mutate({
                              milestoneId: milestone.id,
                              status: e.target.value as Milestone["status"],
                            })
                          }
                          className="p-1 text-sm border rounded"
                        >
                          <option value="planned">Planned</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="delayed">Delayed</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium text-sm mb-2">Tasks</h5>
                      {milestone.tasks.length > 0 ? (
                        <ul className="space-y-2">
                          {milestone.tasks.map((task) => (
                            <li key={task.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={(e) =>
                                  toggleTaskCompletion.mutate({
                                    milestoneId: milestone.id,
                                    taskId: task.id,
                                    completed: e.target.checked,
                                  })
                                }
                                className="mr-2 h-4 w-4"
                              />
                              <span
                                className={`flex-1 ${
                                  task.completed ? "line-through text-gray-500" : ""
                                }`}
                              >
                                {task.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No tasks for this milestone</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No milestones have been added to this roadmap yet.</p>
                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Roadmap to Add Milestones
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Roadmap Yet */}
      {!editMode && !roadmapLoading && selectedStartupId && !roadmap && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4">No Roadmap Created Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't created a roadmap for this startup yet. A roadmap will help you plan and track your
            startup's progress over time.
          </p>
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Your First Roadmap
          </button>
        </div>
      )}
    </div>
  );
}