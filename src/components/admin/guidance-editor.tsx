"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Eye, Edit } from "lucide-react";
import { updateGuidancePage } from "@/lib/actions/guidance";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface GuidanceEditorProps {
  initialTitle: string;
  initialContent: string;
}

export function GuidanceEditor({ initialTitle, initialContent }: GuidanceEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isPreview, setIsPreview] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("content", content);

    const result = await updateGuidancePage(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Guidance page updated!");
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Page Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New Creator Guidance"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Content (Markdown)</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="gap-2"
          >
            {isPreview ? (
              <>
                <Edit className="h-4 w-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Preview
              </>
            )}
          </Button>
        </div>

        {isPreview ? (
          <div className="min-h-[400px] p-4 rounded-xl border border-border bg-secondary/30 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# Welcome to the Team!

Write your guidance content here using Markdown..."
            required
            disabled={isLoading}
            className="min-h-[400px] font-mono text-sm"
          />
        )}

        <p className="text-xs text-muted-foreground">
          Supports Markdown: # Headers, **bold**, *italic*, - lists, [links](url), etc.
        </p>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
