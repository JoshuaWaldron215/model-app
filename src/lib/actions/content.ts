"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ReelCategory, ScriptCategory } from "@prisma/client";
import { getPusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { sendNotificationToUsers, sendNotificationToAllModels } from "./push-notifications";

// Validation schemas
const createReelSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  audioLinkUrl: z.string().optional(),
  caption: z.string().optional(),
  overlayText: z.string().optional(),
  hookText: z.string().optional(),
  instructions: z.string().optional(),
  reelCategory: z.nativeEnum(ReelCategory).optional(),
  isGlobal: z.boolean().default(true),
  assignedModels: z.array(z.string()).optional(),
});

const createScriptSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  scriptContent: z.string().min(1, "Script content is required"),
  scriptCategory: z.nativeEnum(ScriptCategory).optional(),
  isGlobal: z.boolean().default(true),
  assignedModels: z.array(z.string()).optional(),
});

// Helper to check admin access
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// Create a reel
export async function createReel(formData: FormData) {
  const session = await requireAdmin();

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
    videoUrl: formData.get("videoUrl") as string || undefined,
    audioUrl: formData.get("audioUrl") as string || undefined,
    audioLinkUrl: formData.get("audioLinkUrl") as string || undefined,
    caption: formData.get("caption") as string || undefined,
    overlayText: formData.get("overlayText") as string || undefined,
    hookText: formData.get("hookText") as string || undefined,
    instructions: formData.get("instructions") as string || undefined,
    reelCategory: (formData.get("reelCategory") as ReelCategory) || undefined,
    isGlobal: formData.get("isGlobal") === "true",
    assignedModels: formData.getAll("assignedModels") as string[],
  };

  const validated = createReelSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const reel = await db.content.create({
    data: {
      type: "REEL",
      title: validated.data.title,
      description: validated.data.description,
      videoUrl: validated.data.videoUrl,
      audioUrl: validated.data.audioUrl,
      audioLinkUrl: validated.data.audioLinkUrl,
      caption: validated.data.caption,
      overlayText: validated.data.overlayText,
      hookText: validated.data.hookText,
      instructions: validated.data.instructions,
      reelCategory: validated.data.reelCategory,
      isGlobal: validated.data.isGlobal,
      createdById: session.user.id,
    },
  });

  // Create assignments if not global
  if (!validated.data.isGlobal && validated.data.assignedModels?.length) {
    await db.contentAssignment.createMany({
      data: validated.data.assignedModels.map((modelId) => ({
        contentId: reel.id,
        modelId,
      })),
    });
  }

  // Trigger real-time update
  try {
    const pusher = getPusherServer();
    await pusher.trigger(CHANNELS.GLOBAL, EVENTS.NEW_CONTENT, {
      type: "REEL",
      title: validated.data.title,
      id: reel.id,
    });
  } catch (e) {
    console.error("Pusher error:", e);
  }

  // Send push notifications
  try {
    const pushPayload = {
      title: "🎬 New Reel Inspiration",
      body: validated.data.title,
      url: "/dashboard/reels",
      tag: `reel-${reel.id}`,
    };

    if (validated.data.isGlobal) {
      await sendNotificationToAllModels(pushPayload);
    } else if (validated.data.assignedModels?.length) {
      await sendNotificationToUsers(validated.data.assignedModels, pushPayload);
    }
  } catch (e) {
    console.error("Push notification error:", e);
  }

  revalidatePath("/admin/content/reels");
  revalidatePath("/dashboard/reels");
  revalidatePath("/dashboard");
  return { success: true, id: reel.id };
}

// Update a reel
export async function updateReel(formData: FormData) {
  const session = await requireAdmin();

  const id = formData.get("id") as string;
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
    videoUrl: formData.get("videoUrl") as string || undefined,
    audioUrl: formData.get("audioUrl") as string || undefined,
    audioLinkUrl: formData.get("audioLinkUrl") as string || undefined,
    caption: formData.get("caption") as string || undefined,
    overlayText: formData.get("overlayText") as string || undefined,
    hookText: formData.get("hookText") as string || undefined,
    instructions: formData.get("instructions") as string || undefined,
    reelCategory: (formData.get("reelCategory") as ReelCategory) || undefined,
    isGlobal: formData.get("isGlobal") === "true",
    assignedModels: formData.getAll("assignedModels") as string[],
  };

  const validated = createReelSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  await db.content.update({
    where: { id },
    data: {
      title: validated.data.title,
      description: validated.data.description,
      videoUrl: validated.data.videoUrl,
      audioUrl: validated.data.audioUrl,
      audioLinkUrl: validated.data.audioLinkUrl,
      caption: validated.data.caption,
      overlayText: validated.data.overlayText,
      hookText: validated.data.hookText,
      instructions: validated.data.instructions,
      reelCategory: validated.data.reelCategory,
      isGlobal: validated.data.isGlobal,
    },
  });

  // Update assignments
  await db.contentAssignment.deleteMany({ where: { contentId: id } });
  
  if (!validated.data.isGlobal && validated.data.assignedModels?.length) {
    await db.contentAssignment.createMany({
      data: validated.data.assignedModels.map((modelId) => ({
        contentId: id,
        modelId,
      })),
    });
  }

  revalidatePath("/admin/content/reels");
  revalidatePath(`/admin/content/reels/${id}`);
  revalidatePath("/dashboard/reels");
  revalidatePath("/dashboard");
  return { success: true };
}

// Create a script
export async function createScript(formData: FormData) {
  const session = await requireAdmin();

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
    scriptContent: formData.get("scriptContent") as string,
    scriptCategory: (formData.get("scriptCategory") as ScriptCategory) || undefined,
    isGlobal: formData.get("isGlobal") === "true",
    assignedModels: formData.getAll("assignedModels") as string[],
  };

  const validated = createScriptSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const script = await db.content.create({
    data: {
      type: "SCRIPT",
      title: validated.data.title,
      description: validated.data.description,
      scriptContent: validated.data.scriptContent,
      scriptCategory: validated.data.scriptCategory,
      isGlobal: validated.data.isGlobal,
      createdById: session.user.id,
    },
  });

  // Create assignments if not global
  if (!validated.data.isGlobal && validated.data.assignedModels?.length) {
    await db.contentAssignment.createMany({
      data: validated.data.assignedModels.map((modelId) => ({
        contentId: script.id,
        modelId,
      })),
    });
  }

  // Trigger real-time update
  try {
    const pusher = getPusherServer();
    await pusher.trigger(CHANNELS.GLOBAL, EVENTS.NEW_CONTENT, {
      type: "SCRIPT",
      title: validated.data.title,
      id: script.id,
    });
  } catch (e) {
    console.error("Pusher error:", e);
  }

  // Send push notifications
  try {
    const pushPayload = {
      title: "📝 New Script Inspiration",
      body: validated.data.title,
      url: "/dashboard/scripts",
      tag: `script-${script.id}`,
    };

    if (validated.data.isGlobal) {
      await sendNotificationToAllModels(pushPayload);
    } else if (validated.data.assignedModels?.length) {
      await sendNotificationToUsers(validated.data.assignedModels, pushPayload);
    }
  } catch (e) {
    console.error("Push notification error:", e);
  }

  revalidatePath("/admin/content/scripts");
  revalidatePath("/dashboard/scripts");
  revalidatePath("/dashboard");
  return { success: true, id: script.id };
}

// Update a script
export async function updateScript(formData: FormData) {
  const session = await requireAdmin();

  const id = formData.get("id") as string;
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
    scriptContent: formData.get("scriptContent") as string,
    scriptCategory: (formData.get("scriptCategory") as ScriptCategory) || undefined,
    isGlobal: formData.get("isGlobal") === "true",
    assignedModels: formData.getAll("assignedModels") as string[],
  };

  const validated = createScriptSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  await db.content.update({
    where: { id },
    data: {
      title: validated.data.title,
      description: validated.data.description,
      scriptContent: validated.data.scriptContent,
      scriptCategory: validated.data.scriptCategory,
      isGlobal: validated.data.isGlobal,
    },
  });

  // Update assignments
  await db.contentAssignment.deleteMany({ where: { contentId: id } });
  
  if (!validated.data.isGlobal && validated.data.assignedModels?.length) {
    await db.contentAssignment.createMany({
      data: validated.data.assignedModels.map((modelId) => ({
        contentId: id,
        modelId,
      })),
    });
  }

  revalidatePath("/admin/content/scripts");
  revalidatePath(`/admin/content/scripts/${id}`);
  revalidatePath("/dashboard/scripts");
  revalidatePath("/dashboard");
  return { success: true };
}

// Delete content
export async function deleteContent(contentId: string) {
  await requireAdmin();

  const content = await db.content.findUnique({
    where: { id: contentId },
    select: { type: true },
  });

  if (!content) {
    return { error: "Content not found" };
  }

  await db.content.delete({
    where: { id: contentId },
  });

  const adminPath = content.type === "REEL" ? "/admin/content/reels" : "/admin/content/scripts";
  const dashPath = content.type === "REEL" ? "/dashboard/reels" : "/dashboard/scripts";
  revalidatePath(adminPath);
  revalidatePath(dashPath);
  revalidatePath("/dashboard");
  return { success: true };
}

// Toggle content active status
export async function toggleContentStatus(contentId: string) {
  await requireAdmin();

  const content = await db.content.findUnique({
    where: { id: contentId },
    select: { isActive: true, type: true },
  });

  if (!content) {
    return { error: "Content not found" };
  }

  const newStatus = !content.isActive;

  await db.content.update({
    where: { id: contentId },
    data: { isActive: newStatus },
  });

  const adminPath = content.type === "REEL" ? "/admin/content/reels" : "/admin/content/scripts";
  const dashPath = content.type === "REEL" ? "/dashboard/reels" : "/dashboard/scripts";
  revalidatePath(adminPath);
  revalidatePath(dashPath);
  revalidatePath("/dashboard");
  return { success: true, isActive: newStatus };
}

// Get all models for assignment
export async function getModelsForAssignment() {
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
