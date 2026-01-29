"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Megaphone, Pin, Users, Globe, Check } from "lucide-react";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions/announcements";
import { toast } from "sonner";

interface AnnouncementFormProps {
  models: Array<{ id: string; name: string; email: string }>;
  announcement?: {
    id: string;
    title: string;
    body: string;
    isPinned: boolean;
    isGlobal: boolean;
    taggedModels: string[];
  };
}

export function AnnouncementForm({ models, announcement }: AnnouncementFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPinned, setIsPinned] = useState(announcement?.isPinned ?? false);
  const [isGlobal, setIsGlobal] = useState(announcement?.isGlobal ?? true);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(
    new Set(announcement?.taggedModels ?? [])
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("isPinned", isPinned.toString());
    formData.set("isGlobal", isGlobal.toString());

    // Clear and re-add selected models
    formData.delete("taggedModels");
    selectedModels.forEach((id) => formData.append("taggedModels", id));

    const action = announcement ? updateAnnouncement : createAnnouncement;
    if (announcement) {
      formData.append("id", announcement.id);
    }

    const result = await action(formData);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success(announcement ? "Announcement updated!" : "Announcement posted!");
    router.push("/admin/announcements");
    router.refresh();
  }

  function toggleModel(modelId: string) {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
  }

  function selectAllModels() {
    setSelectedModels(new Set(models.map((m) => m.id)));
  }

  function clearSelection() {
    setSelectedModels(new Set());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Megaphone className="h-4 w-4" />
          Announcement Content
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={announcement?.title}
            placeholder="e.g., Important Update"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Message *</Label>
          <Textarea
            id="body"
            name="body"
            defaultValue={announcement?.body}
            placeholder="Write your announcement message here..."
            required
            disabled={isLoading}
            className="min-h-[150px]"
          />
        </div>
      </div>

      {/* Pin Option */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Pin className="h-4 w-4" />
          Priority
        </div>

        <button
          type="button"
          onClick={() => setIsPinned(!isPinned)}
          className={`flex items-center gap-4 p-4 rounded-xl border-2 w-full text-left transition-all ${
            isPinned
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/50"
          }`}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
            isPinned 
              ? "bg-primary border-primary" 
              : "border-muted-foreground/30"
          }`}>
            {isPinned && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <div>
            <p className="font-medium">Pin this announcement</p>
            <p className="text-sm text-muted-foreground">
              Pinned announcements appear at the top of the list
            </p>
          </div>
        </button>
      </div>

      {/* Model Targeting */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="h-4 w-4" />
          Target Audience
        </div>

        {/* Assignment Options */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* All Models Option */}
          <button
            type="button"
            onClick={() => setIsGlobal(true)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              isGlobal
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isGlobal ? "bg-primary/10" : "bg-secondary"}`}>
                <Globe className={`h-5 w-5 ${isGlobal ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="font-medium">All Models</p>
                <p className="text-xs text-muted-foreground">
                  Everyone will see this
                </p>
              </div>
            </div>
          </button>

          {/* Specific Models Option */}
          <button
            type="button"
            onClick={() => setIsGlobal(false)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              !isGlobal
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${!isGlobal ? "bg-primary/10" : "bg-secondary"}`}>
                <Users className={`h-5 w-5 ${!isGlobal ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="font-medium">Specific Models</p>
                <p className="text-xs text-muted-foreground">
                  Tag selected models only
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Model Selection */}
        {!isGlobal && (
          <div className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-center justify-between">
              <Label>Select Models to Tag</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllModels}
                  className="text-xs"
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>

            {models.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {models.map((model) => {
                  const isSelected = selectedModels.has(model.id);
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => toggleModel(model.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        isSelected
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-secondary/50 hover:bg-secondary border border-transparent"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? "bg-primary border-primary" 
                          : "border-muted-foreground/30"
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{model.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{model.email}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active models available
              </p>
            )}

            {selectedModels.size > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedModels.size} model{selectedModels.size !== 1 ? "s" : ""} will be notified
              </p>
            )}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {announcement ? "Updating..." : "Posting..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {announcement ? "Update" : "Post Announcement"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
