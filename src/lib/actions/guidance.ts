"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper to check admin access
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// Get guidance page content
export async function getGuidancePage() {
  let page = await db.guidancePage.findUnique({
    where: { slug: "new-creator" },
  });

  // Create default page if it doesn't exist
  if (!page) {
    page = await db.guidancePage.create({
      data: {
        slug: "new-creator",
        title: "New Creator Guidance",
        content: `# Welcome to the Team! 🎉

We're excited to have you on board! This guide will help you get started.

## Getting Started

1. **Set up your profile** - Upload a profile picture and complete your information
2. **Check your reels** - Review the content assigned to you
3. **Read the scripts** - Familiarize yourself with our messaging

## Best Practices

- Post consistently at optimal times
- Engage with your audience in comments
- Use trending sounds when appropriate
- Follow the instructions provided with each reel

## Need Help?

Reach out to your manager if you have any questions!
`,
      },
    });
  }

  return page;
}

// Update guidance page content
export async function updateGuidancePage(formData: FormData) {
  const session = await requireAdmin();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    return { error: "Title and content are required" };
  }

  await db.guidancePage.upsert({
    where: { slug: "new-creator" },
    update: {
      title,
      content,
      updatedById: session.user.id,
    },
    create: {
      slug: "new-creator",
      title,
      content,
      updatedById: session.user.id,
    },
  });

  revalidatePath("/admin/guidance");
  revalidatePath("/dashboard/guidance");
  return { success: true };
}
