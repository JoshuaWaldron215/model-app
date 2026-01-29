"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    avatarUrl: formData.get("avatarUrl") as string || undefined,
    currentPassword: formData.get("currentPassword") as string || undefined,
    newPassword: formData.get("newPassword") as string || undefined,
  };

  const validated = updateProfileSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  // Check if email is taken by another user
  const existingUser = await db.user.findFirst({
    where: {
      email: validated.data.email,
      NOT: { id: session.user.id },
    },
  });

  if (existingUser) {
    return { error: "Email is already taken" };
  }

  // Prepare update data
  const updateData: {
    name: string;
    email: string;
    avatarUrl?: string | null;
    password?: string;
  } = {
    name: validated.data.name,
    email: validated.data.email,
    avatarUrl: validated.data.avatarUrl || null,
  };

  // Handle password change
  if (validated.data.newPassword && validated.data.newPassword.length > 0) {
    if (!validated.data.currentPassword) {
      return { error: "Current password is required to change password" };
    }

    if (validated.data.newPassword.length < 6) {
      return { error: "New password must be at least 6 characters" };
    }

    // Verify current password
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return { error: "User not found" };
    }

    const isPasswordValid = await bcrypt.compare(
      validated.data.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return { error: "Current password is incorrect" };
    }

    updateData.password = await bcrypt.hash(validated.data.newPassword, 12);
  }

  await db.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/admin/settings");
  return { success: true };
}

// Update avatar
export async function updateAvatar(avatarUrl: string | null) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { avatarUrl },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/admin/settings");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}
