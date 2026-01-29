import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, MessageSquare, Megaphone, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getModelDashboardContent } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function ModelDashboard() {
  const session = await auth();
  const { reels, scripts, announcements } = await getModelDashboardContent(session!.user.id);

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-background p-8 border border-border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Your Creator Hub</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {session?.user.name}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg">
            Find your daily inspiration for reels, scripts, and stay updated with the latest announcements.
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reels Section */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Film className="h-4 w-4 text-accent" />
              </div>
              Reel Ideas
            </CardTitle>
            <Link
              href="/dashboard/reels"
              prefetch={true}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {reels.length > 0 ? (
              <div className="space-y-3">
                {reels.map((reel) => (
                  <div
                    key={reel.id}
                    className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <p className="font-medium text-sm">{reel.title}</p>
                    {reel.hookText && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {reel.hookText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No reel ideas yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Scripts Section */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-success/10">
                <MessageSquare className="h-4 w-4 text-success" />
              </div>
              Scripts
            </CardTitle>
            <Link
              href="/dashboard/scripts"
              prefetch={true}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {scripts.length > 0 ? (
              <div className="space-y-3">
                {scripts.map((script) => (
                  <div
                    key={script.id}
                    className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <p className="font-medium text-sm">{script.title}</p>
                    {script.scriptContent && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {script.scriptContent}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No scripts yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Announcements Section */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-warning/10">
                <Megaphone className="h-4 w-4 text-warning" />
              </div>
              Announcements
            </CardTitle>
            <Link
              href="/dashboard/announcements"
              prefetch={true}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{announcement.title}</p>
                      {announcement.isPinned && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {announcement.body}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No announcements yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
