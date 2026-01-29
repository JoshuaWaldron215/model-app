import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance (only use on server)
let pusherServerInstance: Pusher | null = null;

export const getPusherServer = () => {
  if (!pusherServerInstance) {
    pusherServerInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return pusherServerInstance;
};

// Client-side Pusher instance (only use on client)
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = () => {
  if (typeof window === "undefined") return null;
  
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    );
  }
  return pusherClientInstance;
};

// Channel names
export const CHANNELS = {
  GLOBAL: "global-updates",
  ANNOUNCEMENTS: "announcements",
  CONTENT: "content",
};

// Event names
export const EVENTS = {
  NEW_ANNOUNCEMENT: "new-announcement",
  UPDATE_ANNOUNCEMENT: "update-announcement", 
  DELETE_ANNOUNCEMENT: "delete-announcement",
  NEW_CONTENT: "new-content",
  UPDATE_CONTENT: "update-content",
  DELETE_CONTENT: "delete-content",
  REFRESH: "refresh",
};
