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
import { Play, Music, ExternalLink, Copy, Check, Type, MessageSquare } from "lucide-react";
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

// Helper to detect platform from URL
function getPlatform(url: string): "tiktok" | "instagram" | "video" | null {
  if (!url) return null;
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  if (url.match(/\.(mp4|webm|mov)$/i)) return "video";
  return null;
}

// Get TikTok embed URL
function getTikTokEmbedUrl(url: string): string | null {
  // Extract video ID from TikTok URL
  const match = url.match(/video\/(\d+)/);
  if (match) {
    return `https://www.tiktok.com/embed/v2/${match[1]}`;
  }
  return null;
}

export function ReelCard({ reel }: ReelCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const platform = reel.videoUrl ? getPlatform(reel.videoUrl) : null;

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
          {/* Preview */}
          <div className="relative aspect-[9/16] max-h-64 bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center overflow-hidden">
            {platform === "tiktok" ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">TikTok</span>
              </div>
            ) : platform === "instagram" ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">Instagram Reel</span>
              </div>
            ) : platform === "video" && reel.videoUrl ? (
              <>
                <video
                  src={reel.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                <Play className="h-8 w-8" />
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
              {platform && (
                <Badge variant="secondary" className="text-xs gap-1">
                  {platform === "tiktok" ? "TikTok" : platform === "instagram" ? "Instagram" : "Video"}
                </Badge>
              )}
              {reel.audioLinkUrl && (
                <Badge variant="secondary" className="text-xs gap-1">
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
          {/* Video/Link */}
          {reel.videoUrl && (
            <div className="space-y-2">
              {platform === "tiktok" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-black text-white">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <span className="font-medium">TikTok Inspiration</span>
                  </div>
                  <a
                    href={reel.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <ExternalLink className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Open in TikTok</span>
                  </a>
                </div>
              ) : platform === "instagram" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="font-medium">Instagram Reel</span>
                  </div>
                  <a
                    href={reel.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <ExternalLink className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Open in Instagram</span>
                  </a>
                </div>
              ) : (
                <div className="relative aspect-[9/16] max-h-96 bg-black rounded-lg overflow-hidden mx-auto">
                  <video
                    src={reel.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Hook */}
          {reel.hookText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
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

          {/* Sound Link */}
          {(reel.audioUrl || reel.audioLinkUrl) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Music className="h-4 w-4 text-warning" />
                Sound
              </h4>
              <div className="flex flex-col gap-2">
                {reel.audioUrl && (
                  <audio controls className="w-full">
                    <source src={reel.audioUrl} />
                  </audio>
                )}
                {reel.audioLinkUrl && (
                  <a
                    href={reel.audioLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 text-sm hover:bg-secondary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Sound Link
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {reel.instructions && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-warning">
                📝 Instructions
              </h4>
              <p className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm whitespace-pre-wrap">
                {reel.instructions}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
