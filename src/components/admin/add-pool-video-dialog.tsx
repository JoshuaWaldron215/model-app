"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Film, Music } from "lucide-react";
import { addVideoToPool } from "@/lib/actions/pool";
import { toast } from "sonner";
import { VideoUpload } from "@/components/video-upload";

interface AddPoolVideoDialogProps {
  poolId: string;
}

export function AddPoolVideoDialog({ poolId }: AddPoolVideoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!videoUrl) {
      toast.error("Please upload a video");
      return;
    }

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("poolId", poolId);
    formData.set("videoUrl", videoUrl);

    const result = await addVideoToPool(formData);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success("Video added!");
    setOpen(false);
    setVideoUrl(null);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Video
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Video to Pool</DialogTitle>
          <DialogDescription>
            Upload a video and optionally add a TikTok sound link
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Dance Trend #1"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Video File *
            </Label>
            <VideoUpload
              value={videoUrl}
              onChange={setVideoUrl}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="soundUrl" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              TikTok Sound URL (optional)
            </Label>
            <Input
              id="soundUrl"
              name="soundUrl"
              placeholder="https://www.tiktok.com/music/..."
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              The sound link models should use for this video
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Instructions or notes for models..."
              disabled={isLoading}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !videoUrl}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Video
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
