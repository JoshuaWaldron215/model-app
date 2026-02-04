export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Sparkles } from "lucide-react";
import { GuidanceEditor } from "@/components/admin/guidance-editor";

async function getGuidancePageContent() {
  let page = await db.guidancePage.findUnique({
    where: { slug: "new-creator" },
  });

  // Create default page if it doesn't exist
  if (!page) {
    page = await db.guidancePage.create({
      data: {
        slug: "new-creator",
        title: "New Creator Guidance",
        content: `# Welcome to the Team! 🎉

We're excited to have you on board! This guide will help you get started.

## Getting Started

1. **Set up your profile** - Upload a profile picture and complete your information
2. **Check your reels** - Review the content assigned to you
3. **Read the scripts** - Familiarize yourself with our messaging

## Best Practices

- Post consistently at optimal times
- Engage with your audience in comments
- Use trending sounds when appropriate
- Follow the instructions provided with each reel

## Need Help?

Reach out to your manager if you have any questions!
`,
      },
    });
  }

  return page;
}

export default async function AdminGuidancePage() {
  const guidancePage = await getGuidancePageContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          New Creator Guidance
        </h1>
        <p className="text-muted-foreground mt-1">
          Edit the guidance page content shown to new creators
        </p>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Who sees this?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This page is only visible to models with the <strong>New Creator</strong> tier. 
              You can change a model&apos;s tier in their profile settings.
            </p>
          </div>
        </div>
      </div>

      {/* Editor Card */}
      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
          <CardDescription>
            Use Markdown formatting for headers, lists, bold text, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuidanceEditor 
            initialTitle={guidancePage.title}
            initialContent={guidancePage.content}
          />
        </CardContent>
      </Card>
    </div>
  );
}
