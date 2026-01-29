export const dynamic = "force-dynamic";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ScriptForm } from "@/components/admin/script-form";
import { getModelsForAssignment } from "@/lib/actions/content";

export default async function NewScriptPage() {
  const models = await getModelsForAssignment();

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
          <h1 className="text-3xl font-bold tracking-tight">Add Script</h1>
          <p className="text-muted-foreground mt-1">
            Create a new script inspiration for your models
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Script Details</CardTitle>
          <CardDescription>
            Fill in the details for this script inspiration. Models will see this
            content on their dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScriptForm models={models} />
        </CardContent>
      </Card>
    </div>
  );
}
