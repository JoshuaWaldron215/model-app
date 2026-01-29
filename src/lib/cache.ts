import { unstable_cache } from "next/cache";
import { db } from "./db";

// Cache tags for revalidation
export const CACHE_TAGS = {
  models: "models",
  reels: "reels",
  scripts: "scripts",
  announcements: "announcements",
  stats: "stats",
} as const;

// Cached model queries
export const getModels = unstable_cache(
  async () => {
    return db.user.findMany({
      where: { role: "MODEL", status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  },
  ["active-models"],
  { revalidate: 60, tags: [CACHE_TAGS.models] }
);

// Cached announcements for notification dropdown
export const getRecentAnnouncementsForModel = unstable_cache(
  async (modelId: string) => {
    return db.announcement.findMany({
      where: {
        isActive: true,
        OR: [{ isGlobal: true }, { tags: { some: { modelId } } }],
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 10,
      select: {
        id: true,
        title: true,
        body: true,
        isPinned: true,
        createdAt: true,
      },
    });
  },
  ["model-announcements"],
  { revalidate: 30, tags: [CACHE_TAGS.announcements] }
);

export const getRecentAnnouncementsForAdmin = unstable_cache(
  async () => {
    return db.announcement.findMany({
      where: { isActive: true },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 10,
      select: {
        id: true,
        title: true,
        body: true,
        isPinned: true,
        createdAt: true,
      },
    });
  },
  ["admin-announcements"],
  { revalidate: 30, tags: [CACHE_TAGS.announcements] }
);

// Cached stats for admin dashboard
export const getAdminStats = unstable_cache(
  async () => {
    const [modelCount, reelCount, scriptCount, announcementCount] =
      await Promise.all([
        db.user.count({ where: { role: "MODEL" } }),
        db.content.count({ where: { type: "REEL" } }),
        db.content.count({ where: { type: "SCRIPT" } }),
        db.announcement.count(),
      ]);

    return { modelCount, reelCount, scriptCount, announcementCount };
  },
  ["admin-stats"],
  { revalidate: 60, tags: [CACHE_TAGS.stats] }
);

// Cached recent models for admin dashboard
export const getRecentModels = unstable_cache(
  async () => {
    return db.user.findMany({
      where: { role: "MODEL" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });
  },
  ["recent-models"],
  { revalidate: 60, tags: [CACHE_TAGS.models] }
);

// Cached all models list for admin
export const getAllModels = unstable_cache(
  async () => {
    return db.user.findMany({
      where: { role: "MODEL" },
      orderBy: { createdAt: "desc" },
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
  },
  ["all-models"],
  { revalidate: 30, tags: [CACHE_TAGS.models] }
);

// Cached reels for admin
export const getReels = unstable_cache(
  async () => {
    return db.content.findMany({
      where: { type: "REEL" },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { name: true },
        },
        assignments: {
          include: {
            model: {
              select: { name: true },
            },
          },
        },
      },
    });
  },
  ["reels"],
  { revalidate: 30, tags: [CACHE_TAGS.reels] }
);

// Cached scripts for admin
export const getScripts = unstable_cache(
  async () => {
    return db.content.findMany({
      where: { type: "SCRIPT" },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { name: true },
        },
        assignments: {
          include: {
            model: {
              select: { name: true },
            },
          },
        },
      },
    });
  },
  ["scripts"],
  { revalidate: 30, tags: [CACHE_TAGS.scripts] }
);

// Cached announcements for admin
export const getAnnouncements = unstable_cache(
  async () => {
    return db.announcement.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        createdBy: {
          select: { name: true },
        },
        tags: {
          include: {
            model: {
              select: { name: true },
            },
          },
        },
      },
    });
  },
  ["announcements-list"],
  { revalidate: 30, tags: [CACHE_TAGS.announcements] }
);

// Model content - no cache to ensure fresh data per model
export async function getModelReels(modelId: string) {
  return db.content.findMany({
    where: {
      type: "REEL",
      isActive: true,
      OR: [{ isGlobal: true }, { assignments: { some: { modelId } } }],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getModelScripts(modelId: string) {
  return db.content.findMany({
    where: {
      type: "SCRIPT",
      isActive: true,
      OR: [{ isGlobal: true }, { assignments: { some: { modelId } } }],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getModelAnnouncements(modelId: string) {
  return db.announcement.findMany({
    where: {
      isActive: true,
      OR: [{ isGlobal: true }, { tags: { some: { modelId } } }],
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      createdBy: {
        select: { name: true },
      },
    },
  });
}

// Model dashboard content - fresh data per model
export async function getModelDashboardContent(modelId: string) {
  const [reels, scripts, announcements] = await Promise.all([
    db.content.findMany({
      where: {
        type: "REEL",
        isActive: true,
        OR: [{ isGlobal: true }, { assignments: { some: { modelId } } }],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    db.content.findMany({
      where: {
        type: "SCRIPT",
        isActive: true,
        OR: [{ isGlobal: true }, { assignments: { some: { modelId } } }],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    db.announcement.findMany({
      where: {
        isActive: true,
        OR: [{ isGlobal: true }, { tags: { some: { modelId } } }],
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
  ]);

  return { reels, scripts, announcements };
}
