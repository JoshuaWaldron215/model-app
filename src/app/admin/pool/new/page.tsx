import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { PoolForm } from "@/components/admin/pool-form";

export default function NewPoolPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/pool">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Pool</h1>
          <p className="text-muted-foreground mt-1">
            Create a new daily TikTok pool
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pool Details</CardTitle>
          <CardDescription>
            Set the date and title for this pool. You can add videos after creating it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PoolForm />
        </CardContent>
      </Card>
    </div>
  );
}
