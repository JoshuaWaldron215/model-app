export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Film, MoreHorizontal } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PoolActions } from "@/components/admin/pool-actions";

async function getPools() {
  return db.dailyPool.findMany({
    orderBy: { date: "desc" },
    include: {
      _count: { select: { videos: true } },
    },
  });
}

export default async function AdminPoolPage() {
  const pools = await getPools();

  // Check if today's pool exists
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPool = pools.find(
    (p) => new Date(p.date).toDateString() === today.toDateString()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Daily TikTok Pool
          </h1>
          <p className="text-muted-foreground mt-1">
            Create daily content pools for your models
          </p>
        </div>
        <Link href="/admin/pool/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Pool
          </Button>
        </Link>
      </div>

      {/* Today's Pool Alert */}
      {!todayPool && (
        <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <h3 className="font-medium text-warning">No pool for today</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a pool for today so models have fresh content to work with.
              </p>
              <Link href="/admin/pool/new" className="mt-2 inline-block">
                <Button size="sm" variant="outline" className="mt-2">
                  <Plus className="mr-2 h-3 w-3" />
                  Create Today&apos;s Pool
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pools Grid */}
      {pools.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => {
            const poolDate = new Date(pool.date);
            const isToday = poolDate.toDateString() === today.toDateString();
            const isPast = poolDate < today;

            return (
              <Card
                key={pool.id}
                className={`overflow-hidden transition-all hover:shadow-lg ${
                  isToday ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardContent className="p-0">
                  <Link href={`/admin/pool/${pool.id}`}>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isToday
                                ? "bg-primary/10"
                                : isPast
                                ? "bg-secondary"
                                : "bg-accent/10"
                            }`}
                          >
                            <Calendar
                              className={`h-5 w-5 ${
                                isToday
                                  ? "text-primary"
                                  : isPast
                                  ? "text-muted-foreground"
                                  : "text-accent"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{pool.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(pool.date)}
                            </p>
                          </div>
                        </div>
                        <PoolActions poolId={pool.id} />
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <Badge
                          variant={pool.isActive ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {pool.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {isToday && (
                          <Badge className="text-xs bg-primary">Today</Badge>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                          <Film className="h-4 w-4" />
                          {pool._count.videos} videos
                        </div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No pools yet</h3>
            <p className="text-muted-foreground mt-1">
              Create your first daily TikTok pool to get started.
            </p>
            <Link href="/admin/pool/new" className="mt-4 inline-block">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Pool
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
