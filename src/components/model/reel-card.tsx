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
import { Play, Music, ExternalLink, Copy, Check, Type, MessageSquare, Film } from "lucide-react";
import { toast } from "sonner";
import { ReelCategory } from "@prisma/client";
import { reelCategoryLabels } from "@/lib/utils";

interface ReelCardProps {
  reel: {
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
  };
}

export function ReelCard({ reel }: ReelCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  async function copyToClipboard(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group">
          {/* Video Preview */}
          <div className="relative aspect-[9/16] max-h-64 bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center overflow-hidden">
            {reel.videoUrl ? (
              <>
                <video
                  src={reel.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                <Film className="h-8 w-8" />
                {reel.hookText ? (
                  <p className="text-xs line-clamp-3">&ldquo;{reel.hookText}&rdquo;</p>
                ) : (
                  <span className="text-xs">Tap to view</span>
                )}
              </div>
            )}
            
            {/* Overlay Text Preview */}
            {reel.overlayText && (
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-medium drop-shadow-lg line-clamp-2 bg-black/40 rounded px-2 py-1">
                  {reel.overlayText}
                </p>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold">{reel.title}</h3>
            {reel.hookText && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {reel.hookText}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {reel.reelCategory && (
                <Badge variant="secondary" className="text-xs">
                  {reelCategoryLabels[reel.reelCategory]}
                </Badge>
              )}
              {reel.audioLinkUrl && (
                <Badge variant="secondary" className="text-xs gap-1 bg-primary/10 text-primary">
                  <Music className="h-3 w-3" /> Sound
                </Badge>
              )}
              {reel.caption && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Type className="h-3 w-3" /> Caption
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {reel.title}
            {reel.reelCategory && (
              <Badge variant="secondary">
                {reelCategoryLabels[reel.reelCategory]}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          {reel.videoUrl && (
            <div className="space-y-2">
              <div className="relative aspect-[9/16] max-h-[500px] bg-black rounded-xl overflow-hidden mx-auto">
                <video
                  src={reel.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  playsInline
                />
              </div>
            </div>
          )}

          {/* Sound Link - PROMINENT */}
          {reel.audioLinkUrl && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Music className="h-4 w-4 text-primary" />
                Use This Sound
              </h4>
              <a
                href={reel.audioLinkUrl}
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

          {/* Instructions - PROMINENT */}
          {reel.instructions && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-warning">
                <MessageSquare className="h-4 w-4" />
                Instructions
              </h4>
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                <p className="text-sm whitespace-pre-wrap">{reel.instructions}</p>
              </div>
            </div>
          )}

          {/* Hook Line */}
          {reel.hookText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-accent" />
                  Hook Line
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reel.hookText!, "hook")}
                >
                  {copiedField === "hook" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="p-3 rounded-lg bg-secondary/50 text-sm whitespace-pre-wrap">
                {reel.hookText}
              </p>
            </div>
          )}

          {/* Overlay Text */}
          {reel.overlayText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4 text-accent" />
                  On-Screen Text
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reel.overlayText!, "overlay")}
                >
                  {copiedField === "overlay" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="p-3 rounded-lg bg-secondary/50 text-sm whitespace-pre-wrap">
                {reel.overlayText}
              </p>
            </div>
          )}

          {/* Caption */}
          {reel.caption && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Caption</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reel.caption!, "caption")}
                >
                  {copiedField === "caption" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="p-3 rounded-lg bg-secondary/50 text-sm whitespace-pre-wrap">
                {reel.caption}
              </p>
            </div>
          )}

          {/* Description */}
          {reel.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {reel.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
