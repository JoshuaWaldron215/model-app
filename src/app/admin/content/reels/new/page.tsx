import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReelForm } from "@/components/admin/reel-form";
import { getModelsForAssignment } from "@/lib/actions/content";

export default async function NewReelPage() {
  const models = await getModelsForAssignment();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/content/reels">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Reel Inspiration</h1>
          <p className="text-muted-foreground mt-1">
            Create a new video content inspiration for your models
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reel Details</CardTitle>
          <CardDescription>
            Fill in the details for this reel inspiration. Models will see this content
            on their dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReelForm models={models} />
        </CardContent>
      </Card>
    </div>
  );
}
