"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TaskPriority, TaskStatus } from "@prisma/client";

// Helper to check admin access
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
});

const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
});

// Create a new task
export async function createTask(formData: FormData) {
  const session = await requireAdmin();

  const data = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    priority: (formData.get("priority") as TaskPriority) || "MEDIUM",
  };

  const validated = createTaskSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  await db.task.create({
    data: {
      title: validated.data.title,
      description: validated.data.description,
      dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
      priority: validated.data.priority,
      createdById: session.user.id,
    },
  });

  revalidatePath("/admin/tasks");
  return { success: true };
}

// Update a task
export async function updateTask(formData: FormData) {
  await requireAdmin();

  const data = {
    id: formData.get("id") as string,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    priority: formData.get("priority") as TaskPriority,
    status: formData.get("status") as TaskStatus,
  };

  const validated = updateTaskSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  await db.task.update({
    where: { id: validated.data.id },
    data: {
      title: validated.data.title,
      description: validated.data.description,
      dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
      priority: validated.data.priority,
      status: validated.data.status,
    },
  });

  revalidatePath("/admin/tasks");
  return { success: true };
}

// Toggle task completion (for managers to tick off)
export async function toggleTaskStatus(taskId: string) {
  const session = await requireAdmin();

  const task = await db.task.findUnique({
    where: { id: taskId },
    select: { status: true },
  });

  if (!task) {
    return { error: "Task not found" };
  }

  // Cycle through statuses: PENDING -> IN_PROGRESS -> COMPLETED -> PENDING
  let newStatus: TaskStatus;
  let completedAt: Date | null = null;
  let completedById: string | null = null;

  if (task.status === "PENDING") {
    newStatus = "IN_PROGRESS";
  } else if (task.status === "IN_PROGRESS") {
    newStatus = "COMPLETED";
    completedAt = new Date();
    completedById = session.user.id;
  } else {
    newStatus = "PENDING";
  }

  await db.task.update({
    where: { id: taskId },
    data: {
      status: newStatus,
      completedAt,
      completedById,
    },
  });

  revalidatePath("/admin/tasks");
  return { success: true, status: newStatus };
}

// Mark task as complete
export async function completeTask(taskId: string) {
  const session = await requireAdmin();

  await db.task.update({
    where: { id: taskId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      completedById: session.user.id,
    },
  });

  revalidatePath("/admin/tasks");
  return { success: true };
}

// Reopen a completed task
export async function reopenTask(taskId: string) {
  await requireAdmin();

  await db.task.update({
    where: { id: taskId },
    data: {
      status: "PENDING",
      completedAt: null,
      completedById: null,
    },
  });

  revalidatePath("/admin/tasks");
  return { success: true };
}

// Delete a task
export async function deleteTask(taskId: string) {
  await requireAdmin();

  await db.task.delete({
    where: { id: taskId },
  });

  revalidatePath("/admin/tasks");
  return { success: true };
}

// Get task stats
export async function getTaskStats() {
  await requireAdmin();

  const [total, pending, inProgress, completed, overdue] = await Promise.all([
    db.task.count(),
    db.task.count({ where: { status: "PENDING" } }),
    db.task.count({ where: { status: "IN_PROGRESS" } }),
    db.task.count({ where: { status: "COMPLETED" } }),
    db.task.count({
      where: {
        status: { not: "COMPLETED" },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  return { total, pending, inProgress, completed, overdue };
}
