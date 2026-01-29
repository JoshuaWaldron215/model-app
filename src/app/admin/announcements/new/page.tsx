export const dynamic = "force-dynamic";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { getModelsForTagging } from "@/lib/actions/announcements";

export default async function NewAnnouncementPage() {
  const models = await getModelsForTagging();

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
          <h1 className="text-3xl font-bold tracking-tight">New Announcement</h1>
          <p className="text-muted-foreground mt-1">
            Post an update for your models
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcement Details</CardTitle>
          <CardDescription>
            Create a new announcement. Models will see this on their dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnnouncementForm models={models} />
        </CardContent>
      </Card>
    </div>
  );
}
