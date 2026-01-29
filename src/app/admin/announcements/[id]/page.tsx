export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { getModelsForTagging } from "@/lib/actions/announcements";

interface EditAnnouncementPageProps {
  params: Promise<{ id: string }>;
}

async function getAnnouncement(id: string) {
  return db.announcement.findUnique({
    where: { id },
    include: {
      tags: {
        select: { modelId: true },
      },
    },
  });
}

export default async function EditAnnouncementPage({ params }: EditAnnouncementPageProps) {
  const { id } = await params;
  const [announcement, models] = await Promise.all([
    getAnnouncement(id),
    getModelsForTagging(),
  ]);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/announcements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Announcement</h1>
          <p className="text-muted-foreground mt-1">
            Update this announcement
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcement Details</CardTitle>
          <CardDescription>
            Edit the announcement details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnnouncementForm
            models={models}
            announcement={{
              ...announcement,
              taggedModels: announcement.tags.map((t) => t.modelId),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
