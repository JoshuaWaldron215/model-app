"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Megaphone, Pin, ArrowRight, Check, Film, FileText } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Notification {
  id: string;
  type: "announcement" | "reel" | "script";
  title: string;
  body?: string;
  isPinned?: boolean;
  createdAt: Date | string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  isAdmin?: boolean;
}

export function NotificationDropdown({ 
  notifications,
  isAdmin = false,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [viewed, setViewed] = useState<Set<string>>(new Set());

  // Load viewed notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("viewedNotifications");
    if (stored) {
      setViewed(new Set(JSON.parse(stored)));
    }
  }, []);

  // Mark as viewed when dropdown opens
  useEffect(() => {
    if (open && notifications.length > 0) {
      const newViewed = new Set([...viewed, ...notifications.map(n => n.id)]);
      setViewed(newViewed);
      localStorage.setItem("viewedNotifications", JSON.stringify([...newViewed]));
    }
  }, [open, notifications]);

  const unreadCount = notifications.filter(n => !viewed.has(n.id)).length;
  const recentNotifications = notifications.slice(0, 8);

  const getIcon = (type: string, isPinned?: boolean) => {
    switch (type) {
      case "reel":
        return <Film className="h-3 w-3 text-accent" />;
      case "script":
        return <FileText className="h-3 w-3 text-green-500" />;
      case "announcement":
        return isPinned ? (
          <Pin className="h-3 w-3 text-primary" />
        ) : (
          <Megaphone className="h-3 w-3 text-warning" />
        );
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  const getIconBg = (type: string, isPinned?: boolean) => {
    switch (type) {
      case "reel":
        return "bg-accent/10";
      case "script":
        return "bg-green-500/10";
      case "announcement":
        return isPinned ? "bg-primary/10" : "bg-warning/10";
      default:
        return "bg-secondary";
    }
  };

  const getLink = (notification: Notification) => {
    const basePath = isAdmin ? "/admin" : "/dashboard";
    switch (notification.type) {
      case "reel":
        return `${basePath}${isAdmin ? "/content" : ""}/reels`;
      case "script":
        return `${basePath}${isAdmin ? "/content" : ""}/scripts`;
      case "announcement":
        return `${basePath}/announcements`;
      default:
        return basePath;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "reel":
        return "New Reel";
      case "script":
        return "New Script";
      case "announcement":
        return "Announcement";
      default:
        return "Notification";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
          {unreadCount === 0 && notifications.length > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-muted-foreground/30" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {unreadCount} new
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {recentNotifications.length > 0 ? (
          <>
            <div className="max-h-80 overflow-y-auto">
              {recentNotifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-secondary"
                  asChild
                >
                  <Link href={getLink(notification)}>
                    <div className="flex items-center gap-2 w-full">
                      <div className={`p-1.5 rounded-lg ${getIconBg(notification.type, notification.isPinned)}`}>
                        {getIcon(notification.type, notification.isPinned)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                            {getLabel(notification.type)}
                          </span>
                        </div>
                        <p className="font-medium text-sm truncate">{notification.title}</p>
                        {notification.body && (
                          <p className="text-xs text-muted-foreground truncate">{notification.body}</p>
                        )}
                      </div>
                      {!viewed.has(notification.id) && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 w-full">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center">
              <Link 
                href={isAdmin ? "/admin" : "/dashboard"}
                className="flex items-center gap-1 text-primary text-sm font-medium py-2"
              >
                View Dashboard
                <ArrowRight className="h-3 w-3" />
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <div className="py-8 text-center">
            <Check className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
            <p className="text-xs text-muted-foreground/70">No new notifications</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
