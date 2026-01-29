"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import { toast } from "sonner";

interface RealtimeEvent {
  type: string;
  title?: string;
  message?: string;
}

export function useRealtime() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    // Subscribe to global channel
    const channel = pusher.subscribe(CHANNELS.GLOBAL);

    channel.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true);
    });

    // Listen for new announcements
    channel.bind(EVENTS.NEW_ANNOUNCEMENT, (data: RealtimeEvent) => {
      toast.info("📢 New Announcement", {
        description: data.title || "Check your announcements",
        action: {
          label: "View",
          onClick: () => router.push("/dashboard/announcements"),
        },
      });
      router.refresh();
    });

    // Listen for new content
    channel.bind(EVENTS.NEW_CONTENT, (data: RealtimeEvent) => {
      const message = data.type === "REEL" 
        ? "New reel inspiration added!" 
        : "New script added!";
      
      toast.info("✨ New Content", {
        description: data.title || message,
        action: {
          label: "View",
          onClick: () => router.push(data.type === "REEL" ? "/dashboard/reels" : "/dashboard/scripts"),
        },
      });
      router.refresh();
    });

    // Listen for updates
    channel.bind(EVENTS.UPDATE_CONTENT, () => {
      router.refresh();
    });

    channel.bind(EVENTS.UPDATE_ANNOUNCEMENT, () => {
      router.refresh();
    });

    // Listen for deletions
    channel.bind(EVENTS.DELETE_CONTENT, () => {
      router.refresh();
    });

    channel.bind(EVENTS.DELETE_ANNOUNCEMENT, () => {
      router.refresh();
    });

    // Generic refresh event
    channel.bind(EVENTS.REFRESH, () => {
      router.refresh();
    });

    // Cleanup
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.GLOBAL);
    };
  }, [router]);

  return { isConnected };
}
