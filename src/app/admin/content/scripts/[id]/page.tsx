export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ScriptForm } from "@/components/admin/script-form";
import { getModelsForAssignment } from "@/lib/actions/content";

interface EditScriptPageProps {
  params: Promise<{ id: string }>;
}

async function getScript(id: string) {
  const script = await db.content.findUnique({
    where: { id, type: "SCRIPT" },
    include: {
      assignments: {
        select: { modelId: true },
      },
    },
  });

  return script;
}

export default async function EditScriptPage({ params }: EditScriptPageProps) {
  const { id } = await params;
  const [script, models] = await Promise.all([
    getScript(id),
    getModelsForAssignment(),
  ]);

  if (!script) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/content/scripts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Script</h1>
          <p className="text-muted-foreground mt-1">
            Update this script inspiration
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Script Details</CardTitle>
          <CardDescription>
            Update the details for this script inspiration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScriptForm 
            models={models} 
            script={{
              ...script,
              assignedModels: script.assignments.map((a) => a.modelId),
            }} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
