import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mapmgt.com" },
    update: {},
    create: {
      email: "admin@mapmgt.com",
      password: adminPassword,
      name: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create sample model users
  const modelPassword = await bcrypt.hash("model123", 12);
  const models = [
    { email: "maria@mapmgt.com", name: "Maria" },
    { email: "katherine@mapmgt.com", name: "Katherine" },
    { email: "sophia@mapmgt.com", name: "Sophia" },
  ];

  for (const modelData of models) {
    const model = await prisma.user.upsert({
      where: { email: modelData.email },
      update: {},
      create: {
        email: modelData.email,
        password: modelPassword,
        name: modelData.name,
        role: "MODEL",
        status: "ACTIVE",
      },
    });
    console.log("✅ Model user created:", model.email);
  }

  // Create sample categories and content
  const sampleReels = [
    {
      title: "Morning Routine Reel",
      description: "Show your authentic morning routine",
      caption: "My morning routine that keeps me energized ✨",
      overlayText: "POV: My morning routine",
      hookText: "Start with a close-up of your face waking up",
      reelCategory: "LIFESTYLE" as const,
      instructions: "Film in natural lighting, keep it under 30 seconds",
    },
    {
      title: "Get Ready With Me",
      description: "GRWM content for engagement",
      caption: "Get ready with me for a night out 💄",
      overlayText: "GRWM",
      hookText: "Start with 'I have somewhere to be...'",
      reelCategory: "HIGH_CONVERTING" as const,
      instructions: "Use trending audio, show outfit selection",
    },
  ];

  for (const reel of sampleReels) {
    await prisma.content.create({
      data: {
        type: "REEL",
        title: reel.title,
        description: reel.description,
        caption: reel.caption,
        overlayText: reel.overlayText,
        hookText: reel.hookText,
        reelCategory: reel.reelCategory,
        instructions: reel.instructions,
        isGlobal: true,
        createdById: admin.id,
      },
    });
  }
  console.log("✅ Sample reel content created");

  // Create sample scripts
  const sampleScripts = [
    {
      title: "First Message Ice Breaker",
      scriptContent:
        "Hey! I noticed you just subscribed 💕 Thanks for being here! What made you decide to join?",
      scriptCategory: "ICE_BREAKER" as const,
    },
    {
      title: "PPV Upsell Script",
      scriptContent:
        "I just filmed something special... it's a bit too spicy for the main feed 🔥 Want me to send it to you?",
      scriptCategory: "UPSELL" as const,
    },
    {
      title: "Retention Message",
      scriptContent:
        "Hey babe, I haven't seen you around lately! Just wanted to check in and let you know I miss chatting with you 💋",
      scriptCategory: "RETENTION" as const,
    },
    {
      title: "Re-engagement Script",
      scriptContent:
        "It's been a while! I've been posting some amazing new content... would love to see you back 💕 Here's a little preview of what you've been missing...",
      scriptCategory: "RE_ENGAGEMENT" as const,
    },
  ];

  for (const script of sampleScripts) {
    await prisma.content.create({
      data: {
        type: "SCRIPT",
        title: script.title,
        scriptContent: script.scriptContent,
        scriptCategory: script.scriptCategory,
        isGlobal: true,
        createdById: admin.id,
      },
    });
  }
  console.log("✅ Sample script content created");

  // Create sample announcement
  await prisma.announcement.create({
    data: {
      title: "Welcome to MAP MGT Platform! 🎉",
      body: "Welcome to the new content inspiration platform! Here you'll find all the reels ideas, scripts, and announcements you need. Check back regularly for updates!",
      isPinned: true,
      isGlobal: true,
      createdById: admin.id,
    },
  });
  console.log("✅ Sample announcement created");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
