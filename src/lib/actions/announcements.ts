"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getPusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { sendNotificationToUsers, sendNotificationToAllModels } from "./push-notifications";

// Validation schema
const announcementSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  body: z.string().min(1, "Body is required"),
  isPinned: z.boolean().default(false),
  isGlobal: z.boolean().default(true),
  taggedModels: z.array(z.string()).optional(),
});

// Helper to check admin access
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// Create announcement
export async function createAnnouncement(formData: FormData) {
  const session = await requireAdmin();

  const data = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    isPinned: formData.get("isPinned") === "true",
    isGlobal: formData.get("isGlobal") === "true",
    taggedModels: formData.getAll("taggedModels") as string[],
  };

  const validated = announcementSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const announcement = await db.announcement.create({
    data: {
      title: validated.data.title,
      body: validated.data.body,
      isPinned: validated.data.isPinned,
      isGlobal: validated.data.isGlobal,
      createdById: session.user.id,
    },
  });

  // Create tags if not global
  if (!validated.data.isGlobal && validated.data.taggedModels?.length) {
    await db.announcementTag.createMany({
      data: validated.data.taggedModels.map((modelId) => ({
        announcementId: announcement.id,
        modelId,
      })),
    });
  }

  // Trigger real-time update
  try {
    const pusher = getPusherServer();
    await pusher.trigger(CHANNELS.GLOBAL, EVENTS.NEW_ANNOUNCEMENT, {
      title: validated.data.title,
      id: announcement.id,
    });
  } catch (e) {
    console.error("Pusher error:", e);
  }

  // Send push notifications
  try {
    const pushPayload = {
      title: "📢 New Announcement",
      body: validated.data.title,
      url: "/dashboard/announcements",
      tag: `announcement-${announcement.id}`,
    };

    if (validated.data.isGlobal) {
      await sendNotificationToAllModels(pushPayload);
    } else if (validated.data.taggedModels?.length) {
      await sendNotificationToUsers(validated.data.taggedModels, pushPayload);
    }
  } catch (e) {
    console.error("Push notification error:", e);
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard/announcements");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, id: announcement.id };
}

// Update announcement
export async function updateAnnouncement(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const data = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    isPinned: formData.get("isPinned") === "true",
    isGlobal: formData.get("isGlobal") === "true",
    taggedModels: formData.getAll("taggedModels") as string[],
  };

  const validated = announcementSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  await db.announcement.update({
    where: { id },
    data: {
      title: validated.data.title,
      body: validated.data.body,
      isPinned: validated.data.isPinned,
      isGlobal: validated.data.isGlobal,
    },
  });

  // Update tags
  await db.announcementTag.deleteMany({ where: { announcementId: id } });

  if (!validated.data.isGlobal && validated.data.taggedModels?.length) {
    await db.announcementTag.createMany({
      data: validated.data.taggedModels.map((modelId) => ({
        announcementId: id,
        modelId,
      })),
    });
  }

  revalidatePath("/admin/announcements");
  revalidatePath(`/admin/announcements/${id}`);
  revalidatePath("/dashboard/announcements");
  return { success: true };
}

// Toggle pin status
export async function toggleAnnouncementPin(announcementId: string) {
  await requireAdmin();

  const announcement = await db.announcement.findUnique({
    where: { id: announcementId },
    select: { isPinned: true },
  });

  if (!announcement) {
    return { error: "Announcement not found" };
  }

  const newStatus = !announcement.isPinned;

  await db.announcement.update({
    where: { id: announcementId },
    data: { isPinned: newStatus },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard/announcements");
  return { success: true, isPinned: newStatus };
}

// Delete announcement
export async function deleteAnnouncement(announcementId: string) {
  await requireAdmin();

  await db.announcement.delete({
    where: { id: announcementId },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard/announcements");
  revalidatePath("/admin");
  return { success: true };
}

// Get models for tagging
export async function getModelsForTagging() {
  await requireAdmin();

  return db.user.findMany({
    where: { role: "MODEL", status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });
}
