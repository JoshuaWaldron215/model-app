export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getGuidancePage } from "@/lib/actions/guidance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default async function ModelGuidancePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get user's tier
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { modelTier: true },
  });

  // Only NEW_CREATOR can access this page
  if (user?.modelTier !== "NEW_CREATOR") {
    redirect("/dashboard");
  }

  const guidancePage = await getGuidancePage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          {guidancePage.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          Everything you need to know to get started
        </p>
      </div>

      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Welcome, New Creator!</h3>
            <p className="text-muted-foreground mt-1">
              This guide has been prepared by the team to help you succeed. Take your time to read through it.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            <ReactMarkdown>{guidancePage.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
