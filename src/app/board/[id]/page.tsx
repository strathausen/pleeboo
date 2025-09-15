"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Stats } from "@/components/ui/stats";
import { api } from "@/trpc/react";
import { Check, Edit2, Plus, Share2, Trash2, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  const [newTask, setNewTask] = useState("");
  const [pledgedBy, setPledgedBy] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [shareNotification, setShareNotification] = useState(false);

  const board = api.board.get.useQuery({ id: boardId });

  const addTask = api.board.addTask.useMutation({
    onSuccess: () => {
      setNewTask("");
      setPledgedBy("");
      setIsAddingTask(false);
      void board.refetch();
    },
  });

  const updateTask = api.board.updateTask.useMutation({
    onSuccess: () => {
      setEditingTaskId(null);
      void board.refetch();
    },
  });

  const deleteTask = api.board.deleteTask.useMutation({
    onSuccess: () => {
      void board.refetch();
    },
  });

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask.mutate({
        boardId,
        content: newTask,
        pledgedBy: pledgedBy || undefined,
      });
    }
  };

  const handleToggleComplete = (taskId: number, completed: boolean) => {
    updateTask.mutate({ id: taskId, completed });
  };

  const handleUpdateContent = (taskId: number) => {
    if (editingContent.trim()) {
      updateTask.mutate({ id: taskId, content: editingContent });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: board.data?.title,
          text: `Join our pledge board: ${board.data?.title}`,
          url: url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareNotification(true);
      setTimeout(() => setShareNotification(false), 3000);
    }
  };

  useEffect(() => {
    if (board.data && editingTaskId !== null) {
      const task = board.data.tasks.find((t) => t.id === editingTaskId);
      if (task) {
        setEditingContent(task.content);
      }
    }
  }, [editingTaskId, board.data]);

  if (board.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e0e10]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (board.error || !board.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e0e10]">
        <div className="rounded-sm border border-gray-800 bg-[#141416] p-8">
          <div className="text-gray-400 text-lg">Board not found</div>
        </div>
      </div>
    );
  }

  const completedTasks = board.data.tasks.filter((t) => t.completed).length;
  const totalTasks = board.data.tasks.length;
  const uniqueVolunteers = new Set(
    board.data.tasks.filter((t) => t.pledgedBy).map((t) => t.pledgedBy),
  ).size;

  const boardStats = [
    { label: "Total Tasks", value: totalTasks },
    { label: "Completed", value: completedTasks, className: "text-green-500" },
    { label: "Volunteers", value: uniqueVolunteers },
  ];

  return (
    <div className="min-h-screen bg-[#0e0e10] text-gray-100">
      {/* Header */}
      <div className="border-gray-800 border-b bg-[#0a0a0c] px-6 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Logo in top left */}
          <div className="mb-6">
            <Logo size="md" />
          </div>

          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-2 font-light text-3xl text-white md:text-4xl">
                {board.data.title}
              </h1>
              {board.data.description && (
                <p className="text-gray-400">{board.data.description}</p>
              )}
            </div>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
          <Stats stats={boardStats} />
        </div>
      </div>

      {/* Share Notification */}
      {shareNotification && (
        <div className="fixed top-4 right-4 z-50 rounded-sm border border-gray-800 bg-[#141416] px-4 py-3 text-gray-300 text-sm">
          Link copied to clipboard
        </div>
      )}

      {/* Add Task Section */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          {!isAddingTask ? (
            <Button
              onClick={() => setIsAddingTask(true)}
              variant="outline"
              className="w-full justify-start"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add new task
            </Button>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="mb-3 w-full rounded-sm border border-gray-800 bg-[#0a0a0c] px-3 py-2 text-gray-100 placeholder-gray-600 outline-none transition-colors focus:border-gray-600"
                />
                <input
                  type="text"
                  placeholder="Who's bringing this? (optional)"
                  value={pledgedBy}
                  onChange={(e) => setPledgedBy(e.target.value)}
                  className="mb-4 w-full rounded-sm border border-gray-800 bg-[#0a0a0c] px-3 py-2 text-gray-100 placeholder-gray-600 outline-none transition-colors focus:border-gray-600"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddTask}
                    disabled={!newTask.trim() || addTask.isPending}
                    className="flex-1"
                  >
                    {addTask.isPending ? "Adding..." : "Add"}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTask("");
                      setPledgedBy("");
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          {board.data.tasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">
                  No tasks yet. Add the first one!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {board.data.tasks.map((task) => (
                <Card
                  key={task.id}
                  className={task.completed ? "opacity-50" : ""}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() =>
                          handleToggleComplete(task.id, !task.completed)
                        }
                        className={`mt-0.5 h-5 w-5 rounded-sm border transition-colors ${
                          task.completed
                            ? "border-green-600 bg-green-600"
                            : "border-gray-700 bg-transparent hover:border-gray-600"
                        }`}
                        type="button"
                      >
                        {task.completed && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </button>
                      <div className="flex-1">
                        {editingTaskId === task.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingContent}
                              onChange={(e) =>
                                setEditingContent(e.target.value)
                              }
                              className="flex-1 rounded-sm border border-gray-800 bg-[#0a0a0c] px-2 py-1 text-gray-100 text-sm outline-none transition-colors focus:border-gray-600"
                            />
                            <Button
                              onClick={() => handleUpdateContent(task.id)}
                              size="sm"
                              variant="default"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => setEditingTaskId(null)}
                              size="sm"
                              variant="outline"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-1 items-center gap-2">
                            <span
                              className={`flex-1 text-sm ${
                                task.completed
                                  ? "text-gray-600 line-through"
                                  : "text-gray-200"
                              }`}
                            >
                              {task.content}
                            </span>
                            {!task.completed && (
                              <Button
                                onClick={() => setEditingTaskId(task.id)}
                                size="sm"
                                variant="ghost"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                        {task.pledgedBy && (
                          <div className="mt-1 text-gray-500 text-xs">
                            Pledged by: {task.pledgedBy}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => deleteTask.mutate({ id: task.id })}
                        size="sm"
                        variant="ghost"
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
