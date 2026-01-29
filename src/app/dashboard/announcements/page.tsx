import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Pin } from "lucide-react";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { getModelAnnouncements } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function ModelAnnouncementsPage() {
  const session = await auth();
  const announcements = await getModelAnnouncements(session!.user.id);

  const pinnedAnnouncements = announcements.filter((a) => a.isPinned);
  const regularAnnouncements = announcements.filter((a) => !a.isPinned);

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground mt-1">
          Updates and notifications from the team
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 text-warning">
          <Megaphone className="h-4 w-4" />
          <span className="font-medium">{announcements.length} announcement{announcements.length !== 1 ? "s" : ""}</span>
        </div>
        {pinnedAnnouncements.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Pin className="h-4 w-4" />
            <span className="font-medium">{pinnedAnnouncements.length} pinned</span>
          </div>
        )}
      </div>

      {/* Announcements */}
      {announcements.length > 0 ? (
        <div className="space-y-6">
          {/* Pinned Announcements */}
          {pinnedAnnouncements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Pin className="h-5 w-5 text-primary" />
                Pinned
              </h2>
              {pinnedAnnouncements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                        <Pin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-semibold">{announcement.title}</h3>
                          <Badge variant="default" className="text-xs">Important</Badge>
                        </div>
                        <p className="text-muted-foreground mt-3 whitespace-pre-wrap">
                          {announcement.body}
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">
                          {formatRelativeTime(announcement.createdAt)} • {formatDateTime(announcement.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Regular Announcements */}
          {regularAnnouncements.length > 0 && (
            <div className="space-y-4">
              {pinnedAnnouncements.length > 0 && (
                <h2 className="text-lg font-semibold">Recent</h2>
              )}
              {regularAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-warning/10 shrink-0">
                        <Megaphone className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold">{announcement.title}</h3>
                        <p className="text-muted-foreground mt-3 whitespace-pre-wrap">
                          {announcement.body}
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">
                          {formatRelativeTime(announcement.createdAt)} • {formatDateTime(announcement.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No announcements yet</h3>
              <p className="text-muted-foreground mt-1">
                Check back later for updates from the team
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
