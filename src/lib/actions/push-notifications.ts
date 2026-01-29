"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendPushNotification, PushPayload } from "@/lib/web-push";

// Subscribe to push notifications
export async function subscribeToPush(subscription: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    // Check if subscription already exists
    const existing = await db.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      // Update existing subscription
      await db.pushSubscription.update({
        where: { endpoint: subscription.endpoint },
        data: {
          userId: session.user.id,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });
    } else {
      // Create new subscription
      await db.pushSubscription.create({
        data: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Subscribe error:", error);
    return { error: "Failed to save subscription" };
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(endpoint: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    await db.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return { error: "Failed to remove subscription" };
  }
}

// Send notification to a specific user
export async function sendNotificationToUser(
  userId: string,
  payload: PushPayload
) {
  try {
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId },
    });

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        const result = await sendPushNotification(
          {
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
          payload
        );

        // Remove expired subscriptions
        if (result.expired) {
          await db.pushSubscription.delete({
            where: { id: sub.id },
          });
        }

        return result;
      })
    );

    return { success: true, sent: results.filter((r) => r.success).length };
  } catch (error) {
    console.error("Send notification error:", error);
    return { error: "Failed to send notification" };
  }
}

// Send notification to multiple users (for announcements)
export async function sendNotificationToUsers(
  userIds: string[],
  payload: PushPayload
) {
  try {
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    });

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        const result = await sendPushNotification(
          {
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
          payload
        );

        // Remove expired subscriptions
        if (result.expired) {
          await db.pushSubscription.delete({
            where: { id: sub.id },
          });
        }

        return result;
      })
    );

    return { success: true, sent: results.filter((r) => r.success).length };
  } catch (error) {
    console.error("Send notification error:", error);
    return { error: "Failed to send notifications" };
  }
}

// Send notification to all models
export async function sendNotificationToAllModels(payload: PushPayload) {
  try {
    const models = await db.user.findMany({
      where: { role: "MODEL", status: "ACTIVE" },
      select: { id: true },
    });

    const userIds = models.map((m) => m.id);
    return sendNotificationToUsers(userIds, payload);
  } catch (error) {
    console.error("Send notification error:", error);
    return { error: "Failed to send notifications" };
  }
}
