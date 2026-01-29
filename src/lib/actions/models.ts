"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schemas
const createModelSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const updateModelSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
});

// Helper to check admin access
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// Create a new model
export async function createModel(formData: FormData) {
  await requireAdmin();

  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = createModelSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  // Check if email already exists
  const existingUser = await db.user.findUnique({
    where: { email: validated.data.email },
  });

  if (existingUser) {
    return { error: "A user with this email already exists" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validated.data.password, 12);

  // Create user
  await db.user.create({
    data: {
      name: validated.data.name,
      email: validated.data.email,
      password: hashedPassword,
      role: "MODEL",
      status: "ACTIVE",
    },
  });

  revalidatePath("/admin/models");
  return { success: true };
}

// Update a model
export async function updateModel(formData: FormData) {
  await requireAdmin();

  const data = {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string || undefined,
  };

  const validated = updateModelSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  // Check if email already exists (excluding current user)
  const existingUser = await db.user.findFirst({
    where: {
      email: validated.data.email,
      NOT: { id: validated.data.id },
    },
  });

  if (existingUser) {
    return { error: "A user with this email already exists" };
  }

  // Prepare update data
  const updateData: {
    name: string;
    email: string;
    password?: string;
  } = {
    name: validated.data.name,
    email: validated.data.email,
  };

  // Only update password if provided
  if (validated.data.password && validated.data.password.length >= 6) {
    updateData.password = await bcrypt.hash(validated.data.password, 12);
  }

  await db.user.update({
    where: { id: validated.data.id },
    data: updateData,
  });

  revalidatePath("/admin/models");
  revalidatePath(`/admin/models/${validated.data.id}`);
  return { success: true };
}

// Toggle model status (suspend/activate)
export async function toggleModelStatus(modelId: string) {
  await requireAdmin();

  const model = await db.user.findUnique({
    where: { id: modelId },
    select: { status: true, role: true },
  });

  if (!model || model.role !== "MODEL") {
    return { error: "Model not found" };
  }

  const newStatus = model.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  await db.user.update({
    where: { id: modelId },
    data: { status: newStatus },
  });

  revalidatePath("/admin/models");
  return { success: true, status: newStatus };
}

// Delete a model
export async function deleteModel(modelId: string) {
  await requireAdmin();

  const model = await db.user.findUnique({
    where: { id: modelId },
    select: { role: true },
  });

  if (!model || model.role !== "MODEL") {
    return { error: "Model not found" };
  }

  await db.user.delete({
    where: { id: modelId },
  });

  revalidatePath("/admin/models");
  return { success: true };
}

// Get a single model
export async function getModel(modelId: string) {
  await requireAdmin();

  const model = await db.user.findUnique({
    where: { id: modelId, role: "MODEL" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          contentAssignments: true,
          announcementTags: true,
        },
      },
    },
  });

  return model;
}
