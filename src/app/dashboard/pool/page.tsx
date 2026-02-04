export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Film, Music, ExternalLink, ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PoolVideoCard } from "@/components/model/pool-video-card";

async function getPools() {
  return db.dailyPool.findMany({
    where: { isActive: true },
    orderBy: { date: "desc" },
    include: {
      videos: {
        orderBy: { order: "asc" },
      },
    },
    take: 30, // Last 30 days of pools
  });
}

export default async function ModelPoolPage() {
  const pools = await getPools();

  // Find today's pool
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPool = pools.find(
    (p) => new Date(p.date).toDateString() === today.toDateString()
  );

  // Past pools (not including today)
  const pastPools = pools.filter(
    (p) => new Date(p.date).toDateString() !== today.toDateString()
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          Daily TikTok Pool
        </h1>
        <p className="text-muted-foreground mt-1">
          Fresh content inspiration updated daily
        </p>
      </div>

      {/* Today's Pool */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary text-sm px-3 py-1">Today</Badge>
          <span className="text-muted-foreground">{formatDate(today)}</span>
        </div>

        {todayPool ? (
          <Card className="overflow-hidden border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Film className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{todayPool.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {todayPool.videos.length} video{todayPool.videos.length !== 1 ? "s" : ""} to check out
                  </p>
                </div>
              </div>

              {todayPool.videos.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {todayPool.videos.map((video) => (
                    <PoolVideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Film className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No videos in today&apos;s pool yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">No pool for today</h3>
              <p className="text-muted-foreground mt-1">
                Check back later or browse the archive below
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Archive */}
      {pastPools.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ChevronDown className="h-5 w-5" />
            Archive
          </h2>

          <div className="space-y-4">
            {pastPools.map((pool) => (
              <Card key={pool.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{pool.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(pool.date)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Film className="h-3 w-3 mr-1" />
                      {pool.videos.length}
                    </Badge>
                  </div>

                  {pool.videos.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {pool.videos.map((video) => (
                        <PoolVideoCard key={video.id} video={video} compact />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pools.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No pools available</h3>
            <p className="text-muted-foreground mt-1">
              Content pools will appear here when they&apos;re created
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
