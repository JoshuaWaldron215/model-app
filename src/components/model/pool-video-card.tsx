"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Play, Music, ExternalLink, FileText } from "lucide-react";

interface PoolVideoCardProps {
  video: {
    id: string;
    title: string;
    videoUrl: string;
    soundUrl: string | null;
    notes: string | null;
  };
  compact?: boolean;
}

export function PoolVideoCard({ video, compact = false }: PoolVideoCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black group cursor-pointer">
            <video
              src={video.videoUrl}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-xs font-medium truncate drop-shadow-lg">
                {video.title}
              </p>
            </div>
            {video.soundUrl && (
              <div className="absolute top-2 right-2">
                <Music className="h-4 w-4 text-white drop-shadow-lg" />
              </div>
            )}
          </button>
        </DialogTrigger>
        <VideoDialog video={video} />
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group">
          <div className="relative aspect-[9/16] bg-black">
            <video
              src={video.videoUrl}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <CardContent className="p-3">
            <h4 className="font-medium truncate">{video.title}</h4>
            <div className="flex items-center gap-2 mt-2">
              {video.soundUrl && (
                <Badge variant="secondary" className="text-xs gap-1 bg-primary/10 text-primary">
                  <Music className="h-3 w-3" />
                  Sound
                </Badge>
              )}
              {video.notes && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <FileText className="h-3 w-3" />
                  Notes
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <VideoDialog video={video} />
    </Dialog>
  );
}

function VideoDialog({ video }: { video: PoolVideoCardProps["video"] }) {
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{video.title}</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Video Player */}
        <div className="relative aspect-[9/16] max-h-[500px] bg-black rounded-xl overflow-hidden mx-auto">
          <video
            src={video.videoUrl}
            controls
            className="w-full h-full object-contain"
            playsInline
            autoPlay
          />
        </div>

        {/* Sound Link */}
        {video.soundUrl && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              Use This Sound
            </h4>
            <a
              href={video.soundUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/20">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-primary">Open Sound Link</p>
                <p className="text-xs text-muted-foreground">
                  Click to open the TikTok sound
                </p>
              </div>
              <ExternalLink className="h-5 w-5 text-primary" />
            </a>
          </div>
        )}

        {/* Notes */}
        {video.notes && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-warning">
              <FileText className="h-4 w-4" />
              Notes
            </h4>
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
              <p className="text-sm whitespace-pre-wrap">{video.notes}</p>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
