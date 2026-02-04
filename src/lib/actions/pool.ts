"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Helper to check admin access
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// Validation schemas
const poolSchema = z.object({
  date: z.string(),
  title: z.string().min(1, "Title is required"),
  isActive: z.boolean().optional(),
});

const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  videoUrl: z.string().min(1, "Video is required"),
  soundUrl: z.string().optional(),
  notes: z.string().optional(),
  order: z.number().optional(),
});

// Create a new pool
export async function createPool(formData: FormData) {
  await requireAdmin();

  const data = {
    date: formData.get("date") as string,
    title: formData.get("title") as string,
  };

  const validated = poolSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  // Check if pool already exists for this date
  const existingPool = await db.dailyPool.findUnique({
    where: { date: new Date(validated.data.date) },
  });

  if (existingPool) {
    return { error: "A pool already exists for this date" };
  }

  const pool = await db.dailyPool.create({
    data: {
      date: new Date(validated.data.date),
      title: validated.data.title,
    },
  });

  revalidatePath("/admin/pool");
  revalidatePath("/dashboard/pool");
  return { success: true, poolId: pool.id };
}

// Update a pool
export async function updatePool(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const data = {
    date: formData.get("date") as string,
    title: formData.get("title") as string,
    isActive: formData.get("isActive") === "true",
  };

  const validated = poolSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  // Check if another pool exists for this date
  const existingPool = await db.dailyPool.findFirst({
    where: {
      date: new Date(validated.data.date),
      NOT: { id },
    },
  });

  if (existingPool) {
    return { error: "A pool already exists for this date" };
  }

  await db.dailyPool.update({
    where: { id },
    data: {
      date: new Date(validated.data.date),
      title: validated.data.title,
      isActive: validated.data.isActive,
    },
  });

  revalidatePath("/admin/pool");
  revalidatePath(`/admin/pool/${id}`);
  revalidatePath("/dashboard/pool");
  return { success: true };
}

// Delete a pool
export async function deletePool(poolId: string) {
  await requireAdmin();

  await db.dailyPool.delete({
    where: { id: poolId },
  });

  revalidatePath("/admin/pool");
  revalidatePath("/dashboard/pool");
  return { success: true };
}

// Add video to pool
export async function addVideoToPool(formData: FormData) {
  await requireAdmin();

  const poolId = formData.get("poolId") as string;
  const data = {
    title: formData.get("title") as string,
    videoUrl: formData.get("videoUrl") as string,
    soundUrl: (formData.get("soundUrl") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const validated = videoSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  // Get max order
  const maxOrder = await db.poolVideo.aggregate({
    where: { poolId },
    _max: { order: true },
  });

  await db.poolVideo.create({
    data: {
      poolId,
      title: validated.data.title,
      videoUrl: validated.data.videoUrl,
      soundUrl: validated.data.soundUrl,
      notes: validated.data.notes,
      order: (maxOrder._max.order || 0) + 1,
    },
  });

  revalidatePath("/admin/pool");
  revalidatePath(`/admin/pool/${poolId}`);
  revalidatePath("/dashboard/pool");
  return { success: true };
}

// Update video
export async function updatePoolVideo(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const data = {
    title: formData.get("title") as string,
    videoUrl: formData.get("videoUrl") as string,
    soundUrl: (formData.get("soundUrl") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const validated = videoSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const video = await db.poolVideo.update({
    where: { id },
    data: {
      title: validated.data.title,
      videoUrl: validated.data.videoUrl,
      soundUrl: validated.data.soundUrl,
      notes: validated.data.notes,
    },
  });

  revalidatePath("/admin/pool");
  revalidatePath(`/admin/pool/${video.poolId}`);
  revalidatePath("/dashboard/pool");
  return { success: true };
}

// Delete video from pool
export async function deletePoolVideo(videoId: string) {
  await requireAdmin();

  const video = await db.poolVideo.delete({
    where: { id: videoId },
  });

  revalidatePath("/admin/pool");
  revalidatePath(`/admin/pool/${video.poolId}`);
  revalidatePath("/dashboard/pool");
  return { success: true };
}

// Reorder videos
export async function reorderPoolVideos(poolId: string, videoIds: string[]) {
  await requireAdmin();

  await Promise.all(
    videoIds.map((id, index) =>
      db.poolVideo.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidatePath("/admin/pool");
  revalidatePath(`/admin/pool/${poolId}`);
  revalidatePath("/dashboard/pool");
  return { success: true };
}
