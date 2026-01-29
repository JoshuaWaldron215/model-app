"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { updateAvatar } from "@/lib/actions/settings";
import { toast } from "sonner";

interface AvatarUploadProps {
  user: {
    name: string;
    image?: string | null;
  };
}

export function AvatarUpload({ user }: AvatarUploadProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(user.image || null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be less than 4MB");
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for simple storage
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setPreview(base64);
        
        // Save to database
        const result = await updateAvatar(base64);
        
        if (result.error) {
          toast.error(result.error);
          setPreview(user.image || null);
        } else {
          toast.success("Profile picture updated!");
          router.refresh();
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    setIsUploading(true);
    const result = await updateAvatar(null);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      setPreview(null);
      toast.success("Profile picture removed");
      router.refresh();
    }
    setIsUploading(false);
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24">
          {preview && <AvatarImage src={preview} alt={user.name} />}
          <AvatarFallback className="bg-primary/10 text-primary text-2xl">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            className="relative"
          >
            <Camera className="mr-2 h-4 w-4" />
            {preview ? "Change" : "Upload"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
          </Button>
          
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or GIF. Max 4MB.
        </p>
      </div>
    </div>
  );
}
