import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Film, Globe, Users } from "lucide-react";
import { formatDate, reelCategoryLabels } from "@/lib/utils";
import Link from "next/link";
import { ContentActions } from "@/components/admin/content-actions";
import { getReels } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function ReelsPage() {
  const reels = await getReels();

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reels & TikToks</h1>
          <p className="text-muted-foreground mt-1">
            Manage video content inspirations for your models
          </p>
        </div>
        <Link href="/admin/content/reels/new" prefetch={true}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Reel
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Film className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reels.length}</p>
                <p className="text-sm text-muted-foreground">Total Reels</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reels.filter((r) => r.isGlobal).length}
                </p>
                <p className="text-sm text-muted-foreground">Global</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reels.filter((r) => !r.isGlobal).length}
                </p>
                <p className="text-sm text-muted-foreground">Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      {reels.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reels.map((reel) => (
            <Card
              key={reel.id}
              className={`overflow-hidden transition-all hover:shadow-lg ${
                !reel.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Video Preview */}
              <div className="relative aspect-video bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
                {reel.videoUrl ? (
                  <video
                    src={reel.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground p-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Film className="h-8 w-8 text-primary" />
                    </div>
                    {reel.hookText ? (
                      <p className="text-sm text-center line-clamp-2 max-w-[200px]">
                        &ldquo;{reel.hookText}&rdquo;
                      </p>
                    ) : (
                      <span className="text-xs">No video uploaded</span>
                    )}
                  </div>
                )}
                {/* Category Badge */}
                {reel.reelCategory && (
                  <Badge className="absolute top-2 left-2" variant="secondary">
                    {reelCategoryLabels[reel.reelCategory]}
                  </Badge>
                )}
                {/* Status Badge */}
                {!reel.isActive && (
                  <Badge className="absolute top-2 right-2" variant="destructive">
                    Inactive
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{reel.title}</h3>
                    {reel.caption && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {reel.caption}
                      </p>
                    )}
                  </div>
                  <ContentActions content={reel} type="reel" />
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  {reel.isGlobal ? (
                    <span className="flex items-center gap-1 text-primary">
                      <Globe className="h-3 w-3" /> All models
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {reel.assignments.length} model{reel.assignments.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span>•</span>
                  <span>{formatDate(reel.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No reels yet</h3>
              <p className="text-muted-foreground mt-1">
                Add your first reel inspiration to get started
              </p>
              <Link href="/admin/content/reels/new">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Reel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
