export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  ListTodo,
  Target,
  TrendingUp 
} from "lucide-react";
import { CreateTaskDialog } from "@/components/admin/create-task-dialog";
import { TaskList } from "@/components/admin/task-list";

async function getTasks() {
  return db.task.findMany({
    orderBy: [
      { status: "asc" },
      { priority: "desc" },
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
    include: {
      createdBy: { select: { name: true } },
      completedBy: { select: { name: true } },
    },
  });
}

async function getTaskStats() {
  const now = new Date();
  
  const [total, pending, inProgress, completed, overdue] = await Promise.all([
    db.task.count(),
    db.task.count({ where: { status: "PENDING" } }),
    db.task.count({ where: { status: "IN_PROGRESS" } }),
    db.task.count({ where: { status: "COMPLETED" } }),
    db.task.count({
      where: {
        status: { not: "COMPLETED" },
        dueDate: { lt: now },
      },
    }),
  ]);

  // Tasks completed this week
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const completedThisWeek = await db.task.count({
    where: {
      status: "COMPLETED",
      completedAt: { gte: weekStart },
    },
  });

  return { total, pending, inProgress, completed, overdue, completedThisWeek };
}

export default async function AdminTasksPage() {
  const [tasks, stats] = await Promise.all([getTasks(), getTaskStats()]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ListTodo className="h-8 w-8 text-primary" />
            Task Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage team tasks
          </p>
        </div>
        <CreateTaskDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending + stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckSquare className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedThisWeek}</p>
                <p className="text-sm text-muted-foreground">Done This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.overdue > 0 ? "bg-destructive/10" : "bg-secondary"}`}>
                <AlertTriangle className={`h-5 w-5 ${stats.overdue > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            All Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList tasks={tasks} serverTime={Date.now()} />
        </CardContent>
      </Card>
    </div>
  );
}
