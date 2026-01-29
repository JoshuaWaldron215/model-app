import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Megaphone, Pin, Globe, Users } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { AnnouncementActions } from "@/components/admin/announcement-actions";
import { getAnnouncements } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();
  const pinnedCount = announcements.filter((a) => a.isPinned).length;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Post updates and notifications for your models
          </p>
        </div>
        <Link href="/admin/announcements/new" prefetch={true}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Announcement
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Megaphone className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{announcements.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Pin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pinnedCount}</p>
                <p className="text-sm text-muted-foreground">Pinned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <Globe className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {announcements.filter((a) => a.isGlobal).length}
                </p>
                <p className="text-sm text-muted-foreground">Global</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`transition-all hover:shadow-lg ${
                announcement.isPinned ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {announcement.isPinned && (
                        <Badge variant="default" className="gap-1">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                      {announcement.isGlobal ? (
                        <Badge variant="secondary" className="gap-1">
                          <Globe className="h-3 w-3" />
                          All Models
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {announcement.tags.length} model{announcement.tags.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>

                    {/* Title & Body */}
                    <h3 className="text-xl font-semibold mt-3">
                      {announcement.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-3">
                      {announcement.body}
                    </p>

                    {/* Tagged Models */}
                    {!announcement.isGlobal && announcement.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs text-muted-foreground">Tagged:</span>
                        {announcement.tags.slice(0, 5).map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.model.name}
                          </Badge>
                        ))}
                        {announcement.tags.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{announcement.tags.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <p className="text-xs text-muted-foreground mt-4">
                      Posted by {announcement.createdBy.name} • {formatDateTime(announcement.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <AnnouncementActions announcement={announcement} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No announcements yet</h3>
              <p className="text-muted-foreground mt-1">
                Post your first announcement to notify models
              </p>
              <Link href="/admin/announcements/new">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  New Announcement
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
