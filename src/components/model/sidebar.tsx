"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Film,
  MessageSquare,
  Megaphone,
  Sparkles,
  Heart,
  Loader2,
  Settings,
} from "lucide-react";
import { useMobileSidebar } from "@/components/mobile-sidebar-context";
import { useEffect, useState, useTransition } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reels", href: "/dashboard/reels", icon: Film },
  { name: "Scripts", href: "/dashboard/scripts", icon: MessageSquare },
  { name: "News", href: "/dashboard/announcements", icon: Megaphone },
];

const fullNavigation = [
  ...navigation,
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function ModelSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useMobileSidebar();
  const [isPending, startTransition] = useTransition();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Close sidebar on route change
  useEffect(() => {
    close();
    setPendingPath(null);
  }, [pathname, close]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleMobileNav = (href: string) => {
    if (pathname === href) return;
    setPendingPath(href);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={close}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-gradient">MAP</span>
                <span className="text-foreground"> MGT</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {fullNavigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      prefetch={true}
                      className={cn(
                        "group flex gap-x-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Model badge */}
          <div className="flex items-center gap-3 rounded-xl bg-accent/5 border border-accent/10 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Heart className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">Creator Hub</p>
              <p className="text-xs text-muted-foreground">Your inspiration space</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card/50 backdrop-blur-xl px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-gradient">MAP</span>
                <span className="text-foreground"> MGT</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {fullNavigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      prefetch={true}
                      className={cn(
                        "group flex gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Model badge */}
          <div className="flex items-center gap-3 rounded-xl bg-accent/5 border border-accent/10 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Heart className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">Creator Hub</p>
              <p className="text-xs text-muted-foreground">Your inspiration space</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe">
        <nav className="flex items-center justify-around px-1 py-1.5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const isLoading = pendingPath === item.href && isPending;

            return (
              <button
                key={item.name}
                onClick={() => handleMobileNav(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl min-w-[60px] touch-manipulation",
                  isActive || isLoading
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground active:bg-secondary"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
                )}
                <span className="text-[10px] font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
