"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, X, Film, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";

interface VideoUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function VideoUpload({ value, onChange, disabled }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("reelVideo", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        onChange(res[0].url);
        toast.success("Video uploaded successfully!");
      }
      setIsUploading(false);
    },
    onUploadError: (error) => {
      toast.error(error.message || "Failed to upload video");
      setIsUploading(false);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      
      // Validate file size (512MB limit)
      if (file.size > 512 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 512MB.");
        return;
      }

      setIsUploading(true);
      await startUpload([file]);
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".webm", ".mov", ".avi"],
    },
    maxFiles: 1,
    disabled: disabled || isUploading,
  });

  const removeVideo = () => {
    onChange(null);
  };

  if (value) {
    return (
      <div className="space-y-3">
        <div className="relative aspect-[9/16] max-h-80 bg-black rounded-xl overflow-hidden">
          <video
            src={value}
            controls
            className="w-full h-full object-contain"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={removeVideo}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Video uploaded successfully
        </p>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-8
        transition-all cursor-pointer
        ${isDragActive 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-muted-foreground/50 hover:bg-secondary/30"
        }
        ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4 text-center">
        {isUploading ? (
          <>
            <div className="p-4 rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div>
              <p className="font-medium">Uploading video...</p>
              <p className="text-sm text-muted-foreground">
                This may take a moment
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-full bg-secondary">
              {isDragActive ? (
                <Upload className="h-8 w-8 text-primary" />
              ) : (
                <Film className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {isDragActive ? "Drop video here" : "Upload video file"}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, WebM, MOV • Max 512MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
