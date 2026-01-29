"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Film, Music, Type, MessageSquare, Users, Globe, Check } from "lucide-react";
import { createReel, updateReel } from "@/lib/actions/content";
import { toast } from "sonner";
import { ReelCategory } from "@prisma/client";
import { reelCategoryLabels } from "@/lib/utils";

interface ReelFormProps {
  models: Array<{ id: string; name: string; email: string }>;
  reel?: {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string | null;
    audioUrl: string | null;
    audioLinkUrl: string | null;
    caption: string | null;
    overlayText: string | null;
    hookText: string | null;
    instructions: string | null;
    reelCategory: ReelCategory | null;
    isGlobal: boolean;
    assignedModels: string[];
  };
}

export function ReelForm({ models, reel }: ReelFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGlobal, setIsGlobal] = useState(reel?.isGlobal ?? true);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(
    new Set(reel?.assignedModels ?? [])
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("isGlobal", isGlobal.toString());
    
    // Clear and re-add selected models
    formData.delete("assignedModels");
    selectedModels.forEach((id) => formData.append("assignedModels", id));

    const action = reel ? updateReel : createReel;
    if (reel) {
      formData.append("id", reel.id);
    }

    const result = await action(formData);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success(reel ? "Reel updated!" : "Reel created!");
    router.push("/admin/content/reels");
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
          <Film className="h-4 w-4" />
          Basic Information
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={reel?.title}
              placeholder="e.g., Morning Routine Reel"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reelCategory">Category</Label>
            <Select name="reelCategory" defaultValue={reel?.reelCategory || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(reelCategoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={reel?.description || ""}
            placeholder="Brief description of this reel idea..."
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Media */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Music className="h-4 w-4" />
          Media
        </div>

        <div className="space-y-2">
          <Label htmlFor="videoUrl">TikTok / Instagram URL</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            defaultValue={reel?.videoUrl || ""}
            placeholder="https://www.tiktok.com/@user/video/... or https://www.instagram.com/reel/..."
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Paste a TikTok or Instagram Reel URL for inspiration
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="audioUrl">Audio File URL (optional)</Label>
            <Input
              id="audioUrl"
              name="audioUrl"
              defaultValue={reel?.audioUrl || ""}
              placeholder="https://example.com/audio.mp3"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioLinkUrl">Sound Link (optional)</Label>
            <Input
              id="audioLinkUrl"
              name="audioLinkUrl"
              defaultValue={reel?.audioLinkUrl || ""}
              placeholder="TikTok/Instagram sound link"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Type className="h-4 w-4" />
          Text Content
        </div>

        <div className="space-y-2">
          <Label htmlFor="hookText">Hook Line</Label>
          <Textarea
            id="hookText"
            name="hookText"
            defaultValue={reel?.hookText || ""}
            placeholder="The opening hook to grab attention..."
            disabled={isLoading}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="overlayText">Overlay Text (On-Screen)</Label>
          <Textarea
            id="overlayText"
            name="overlayText"
            defaultValue={reel?.overlayText || ""}
            placeholder="Text that appears on the video..."
            disabled={isLoading}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="caption">Caption (Below Video)</Label>
          <Textarea
            id="caption"
            name="caption"
            defaultValue={reel?.caption || ""}
            placeholder="Caption for posting..."
            disabled={isLoading}
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          Admin Instructions
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions for Models</Label>
          <Textarea
            id="instructions"
            name="instructions"
            defaultValue={reel?.instructions || ""}
            placeholder="Additional notes or instructions for the models..."
            disabled={isLoading}
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Assignment */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="h-4 w-4" />
          Model Assignment
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
                  Every model will see this content
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
                  Choose which models see this
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Model Selection */}
        {!isGlobal && (
          <div className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-center justify-between">
              <Label>Select Models</Label>
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
                {selectedModels.size} model{selectedModels.size !== 1 ? "s" : ""} selected
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
              {reel ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {reel ? "Update Reel" : "Create Reel"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
