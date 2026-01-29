export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReelForm } from "@/components/admin/reel-form";
import { getModelsForAssignment } from "@/lib/actions/content";

interface EditReelPageProps {
  params: Promise<{ id: string }>;
}

async function getReel(id: string) {
  const reel = await db.content.findUnique({
    where: { id, type: "REEL" },
    include: {
      assignments: {
        select: { modelId: true },
      },
    },
  });

  return reel;
}

export default async function EditReelPage({ params }: EditReelPageProps) {
  const { id } = await params;
  const [reel, models] = await Promise.all([
    getReel(id),
    getModelsForAssignment(),
  ]);

  if (!reel) {
    notFound();
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Reel</h1>
          <p className="text-muted-foreground mt-1">
            Update this reel inspiration
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reel Details</CardTitle>
          <CardDescription>
            Update the details for this reel inspiration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReelForm 
            models={models} 
            reel={{
              ...reel,
              assignedModels: reel.assignments.map((a) => a.modelId),
            }} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
