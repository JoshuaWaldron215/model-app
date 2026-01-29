import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film } from "lucide-react";
import { reelCategoryLabels } from "@/lib/utils";
import { ReelCard } from "@/components/model/reel-card";
import { getModelReels } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function ModelReelsPage() {
  const session = await auth();
  const reels = await getModelReels(session!.user.id);

  // Group by category
  const categorizedReels = reels.reduce((acc, reel) => {
    const category = reel.reelCategory || "OTHER";
    if (!acc[category]) acc[category] = [];
    acc[category].push(reel);
    return acc;
  }, {} as Record<string, typeof reels>);

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reels & TikToks</h1>
        <p className="text-muted-foreground mt-1">
          Video content inspirations curated for you
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent">
          <Film className="h-4 w-4" />
          <span className="font-medium">{reels.length} inspirations</span>
        </div>
      </div>

      {/* Content */}
      {reels.length > 0 ? (
        <div className="space-y-10">
          {Object.entries(reelCategoryLabels).map(([category, label]) => {
            const categoryReels = categorizedReels[category];
            if (!categoryReels?.length) return null;

            return (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Badge variant="secondary">{label}</Badge>
                  <span className="text-sm font-normal text-muted-foreground">
                    {categoryReels.length} {categoryReels.length === 1 ? "reel" : "reels"}
                  </span>
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categoryReels.map((reel) => (
                    <ReelCard key={reel.id} reel={reel} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No reels yet</h3>
              <p className="text-muted-foreground mt-1">
                Check back later for new content inspirations
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
