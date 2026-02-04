"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Music, Trash2, Loader2, Film, FileText } from "lucide-react";
import { deletePoolVideo } from "@/lib/actions/pool";
import { toast } from "sonner";

interface PoolVideo {
  id: string;
  title: string;
  videoUrl: string;
  soundUrl: string | null;
  notes: string | null;
  order: number;
}

interface PoolVideoListProps {
  videos: PoolVideo[];
  poolId: string;
}

export function PoolVideoList({ videos, poolId }: PoolVideoListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deletingId) return;
    setIsDeleting(true);

    const result = await deletePoolVideo(deletingId);

    if (result.success) {
      toast.success("Video removed");
      router.refresh();
    } else {
      toast.error("Failed to remove video");
    }

    setIsDeleting(false);
    setDeletingId(null);
  }

  if (videos.length === 0) {
    return (
      <div className="py-12 text-center">
        <Film className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="font-semibold">No videos yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add videos to this pool for models to see
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="flex gap-4 p-4 rounded-xl border border-border bg-secondary/20"
          >
            {/* Video Preview */}
            <div className="relative w-24 h-32 rounded-lg overflow-hidden bg-black shrink-0">
              <video
                src={video.videoUrl}
                className="w-full h-full object-cover"
                muted
                preload="metadata"
              />
              <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                #{index + 1}
              </div>
            </div>

            {/* Video Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{video.title}</h4>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {video.soundUrl && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Music className="h-3 w-3" />
                    Sound Link
                  </Badge>
                )}
                {video.notes && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <FileText className="h-3 w-3" />
                    Has Notes
                  </Badge>
                )}
              </div>

              {video.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {video.notes}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeletingId(video.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this video from the pool. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
