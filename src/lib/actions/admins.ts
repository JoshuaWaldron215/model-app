"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Helper to check admin access
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// Create a new admin
export async function createAdmin(formData: FormData) {
  await requireAdmin();

  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = createAdminSchema.safeParse(data);
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

  // Create admin user
  await db.user.create({
    data: {
      name: validated.data.name,
      email: validated.data.email,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  revalidatePath("/admin/settings/team");
  return { success: true };
}

// Toggle admin status (suspend/activate)
export async function toggleAdminStatus(adminId: string) {
  const session = await requireAdmin();

  // Prevent self-suspension
  if (adminId === session.user.id) {
    return { error: "You cannot suspend yourself" };
  }

  const admin = await db.user.findUnique({
    where: { id: adminId },
    select: { status: true, role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    return { error: "Admin not found" };
  }

  const newStatus = admin.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  await db.user.update({
    where: { id: adminId },
    data: { status: newStatus },
  });

  revalidatePath("/admin/settings/team");
  return { success: true, status: newStatus };
}

// Delete an admin
export async function deleteAdmin(adminId: string) {
  const session = await requireAdmin();

  // Prevent self-deletion
  if (adminId === session.user.id) {
    return { error: "You cannot delete yourself" };
  }

  const admin = await db.user.findUnique({
    where: { id: adminId },
    select: { role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    return { error: "Admin not found" };
  }

  // Check if this is the last admin
  const adminCount = await db.user.count({
    where: { role: "ADMIN" },
  });

  if (adminCount <= 1) {
    return { error: "Cannot delete the last admin account" };
  }

  await db.user.delete({
    where: { id: adminId },
  });

  revalidatePath("/admin/settings/team");
  return { success: true };
}
