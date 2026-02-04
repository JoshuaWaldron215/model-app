"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Circle,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  RotateCcw,
  Loader2,
  AlertTriangle,
  ListTodo,
} from "lucide-react";
import { completeTask, reopenTask, deleteTask } from "@/lib/actions/tasks";
import { toast } from "sonner";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  completedAt: Date | null;
  createdBy: { name: string };
  completedBy: { name: string } | null;
}

interface TaskListProps {
  tasks: Task[];
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  LOW: { label: "Low", color: "text-muted-foreground", bgColor: "bg-secondary" },
  MEDIUM: { label: "Medium", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  HIGH: { label: "High", color: "text-warning", bgColor: "bg-warning/10" },
  URGENT: { label: "Urgent", color: "text-destructive", bgColor: "bg-destructive/10" },
};

const statusConfig: Record<TaskStatus, { label: string; icon: typeof Circle; color: string }> = {
  PENDING: { label: "Pending", icon: Circle, color: "text-muted-foreground" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-warning" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, color: "text-green-500" },
};

export function TaskList({ tasks }: TaskListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleComplete(taskId: string) {
    setLoadingId(taskId);
    const result = await completeTask(taskId);
    if (result.success) {
      toast.success("Task completed!");
      router.refresh();
    }
    setLoadingId(null);
  }

  async function handleReopen(taskId: string) {
    setLoadingId(taskId);
    const result = await reopenTask(taskId);
    if (result.success) {
      toast.success("Task reopened");
      router.refresh();
    }
    setLoadingId(null);
  }

  async function handleDelete() {
    if (!deletingId) return;
    setLoadingId(deletingId);
    const result = await deleteTask(deletingId);
    if (result.success) {
      toast.success("Task deleted");
      router.refresh();
    }
    setLoadingId(null);
    setDeletingId(null);
  }

  // Check if task is overdue
  const isOverdue = (task: Task) => {
    if (task.status === "COMPLETED" || !task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center">
        <ListTodo className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="font-semibold text-lg">No tasks yet</h3>
        <p className="text-muted-foreground mt-1">
          Create your first task to get started
        </p>
      </div>
    );
  }

  // Group tasks by status
  const pendingTasks = tasks.filter((t) => t.status === "PENDING");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const renderTask = (task: Task) => {
    const StatusIcon = statusConfig[task.status].icon;
    const overdue = isOverdue(task);
    const isLoading = loadingId === task.id;

    return (
      <div
        key={task.id}
        className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
          task.status === "COMPLETED"
            ? "bg-secondary/30 border-border opacity-70"
            : overdue
            ? "bg-destructive/5 border-destructive/20"
            : "bg-card border-border hover:shadow-md"
        }`}
      >
        {/* Status Toggle Button */}
        <button
          onClick={() =>
            task.status === "COMPLETED" ? handleReopen(task.id) : handleComplete(task.id)
          }
          disabled={isLoading}
          className={`mt-0.5 shrink-0 transition-colors ${
            task.status === "COMPLETED"
              ? "text-green-500 hover:text-muted-foreground"
              : "text-muted-foreground hover:text-green-500"
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <StatusIcon className="h-5 w-5" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4
                className={`font-medium ${
                  task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {task.status === "COMPLETED" ? (
                  <DropdownMenuItem onClick={() => handleReopen(task.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reopen Task
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleComplete(task.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeletingId(task.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge className={`text-xs ${priorityConfig[task.priority].bgColor} ${priorityConfig[task.priority].color} border-0`}>
              {priorityConfig[task.priority].label}
            </Badge>

            {task.dueDate && (
              <Badge
                variant="secondary"
                className={`text-xs gap-1 ${overdue ? "bg-destructive/10 text-destructive" : ""}`}
              >
                {overdue && <AlertTriangle className="h-3 w-3" />}
                Due {formatDate(task.dueDate)}
              </Badge>
            )}

            {task.completedAt && task.completedBy && (
              <span className="text-xs text-muted-foreground">
                Completed by {task.completedBy.name}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Pending & In Progress */}
        {(pendingTasks.length > 0 || inProgressTasks.length > 0) && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Active ({pendingTasks.length + inProgressTasks.length})
            </h3>
            <div className="space-y-2">
              {[...inProgressTasks, ...pendingTasks].map(renderTask)}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.slice(0, 5).map(renderTask)}
              {completedTasks.length > 5 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  +{completedTasks.length - 5} more completed tasks
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
