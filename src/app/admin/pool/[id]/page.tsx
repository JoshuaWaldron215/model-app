export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Film, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PoolForm } from "@/components/admin/pool-form";
import { PoolVideoList } from "@/components/admin/pool-video-list";
import { AddPoolVideoDialog } from "@/components/admin/add-pool-video-dialog";

interface EditPoolPageProps {
  params: Promise<{ id: string }>;
}

async function getPool(id: string) {
  return db.dailyPool.findUnique({
    where: { id },
    include: {
      videos: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export default async function EditPoolPage({ params }: EditPoolPageProps) {
  const { id } = await params;
  const pool = await getPool(id);

  if (!pool) {
    notFound();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const poolDate = new Date(pool.date);
  const isToday = poolDate.toDateString() === today.toDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/pool">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{pool.title}</h1>
            {isToday && <Badge className="bg-primary">Today</Badge>}
            <Badge variant={pool.isActive ? "success" : "secondary"}>
              {pool.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(pool.date)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pool Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pool Details</CardTitle>
            <CardDescription>Update pool information</CardDescription>
          </CardHeader>
          <CardContent>
            <PoolForm pool={pool} />
          </CardContent>
        </Card>

        {/* Videos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Videos ({pool.videos.length})
                </CardTitle>
                <CardDescription>
                  Manage videos in this pool
                </CardDescription>
              </div>
              <AddPoolVideoDialog poolId={pool.id} />
            </div>
          </CardHeader>
          <CardContent>
            <PoolVideoList videos={pool.videos} poolId={pool.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
