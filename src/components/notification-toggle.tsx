"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/actions/push-notifications";
import { toast } from "sonner";

export function NotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  async function checkNotificationStatus() {
    // Check if push notifications are supported
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setIsSupported(false);
      setIsLoading(false);
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);

    // Check if already subscribed
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }

    setIsLoading(false);
  }

  async function handleToggle(enabled: boolean) {
    setIsLoading(true);

    try {
      if (enabled) {
        // Request permission if not granted
        if (Notification.permission === "default") {
          const result = await Notification.requestPermission();
          setPermission(result);
          if (result !== "granted") {
            toast.error("Notification permission denied");
            setIsLoading(false);
            return;
          }
        } else if (Notification.permission === "denied") {
          toast.error("Notifications are blocked. Please enable them in your browser settings.");
          setIsLoading(false);
          return;
        }

        // Subscribe to push
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          toast.error("Push notifications not configured");
          setIsLoading(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Save to server
        const subJson = subscription.toJSON();
        const result = await subscribeToPush({
          endpoint: subJson.endpoint!,
          keys: {
            p256dh: subJson.keys!.p256dh,
            auth: subJson.keys!.auth,
          },
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          setIsSubscribed(true);
          toast.success("Notifications enabled!");
        }
      } else {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          await unsubscribeFromPush(subscription.endpoint);
        }

        setIsSubscribed(false);
        toast.success("Notifications disabled");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to update notification settings");
    }

    setIsLoading(false);
  }

  // Not supported
  if (!isSupported && !isLoading) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
        <div className="flex items-center gap-3">
          <BellOff className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Not supported on this browser
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-secondary text-sm font-medium text-muted-foreground">
          Unavailable
        </div>
      </div>
    );
  }

  // Permission denied
  if (permission === "denied" && !isLoading) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
        <div className="flex items-center gap-3">
          <BellOff className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Blocked by browser. Enable in browser settings.
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
          Blocked
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <Bell className="h-5 w-5 text-green-500" />
        ) : (
          <BellOff className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <p className="font-medium">Push Notifications</p>
          <p className="text-sm text-muted-foreground">
            {isSubscribed 
              ? "You'll be notified of new content & announcements" 
              : "Get notified when new content is posted"}
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      )}
    </div>
  );
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
