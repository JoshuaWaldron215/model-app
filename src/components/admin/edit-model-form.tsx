"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Eye, EyeOff, Save, Sparkles, Award } from "lucide-react";
import { updateModel } from "@/lib/actions/models";
import { toast } from "sonner";
import { UserStatus, ModelTier } from "@prisma/client";

interface EditModelFormProps {
  model: {
    id: string;
    name: string;
    email: string;
    status: UserStatus;
    modelTier: ModelTier | null;
  };
}

const tierLabels: Record<ModelTier, { label: string; description: string; icon: typeof Sparkles }> = {
  NEW_CREATOR: {
    label: "New Creator",
    description: "Access to guidance resources",
    icon: Sparkles,
  },
  ESTABLISHED: {
    label: "Established",
    description: "Standard model access",
    icon: Award,
  },
};

export function EditModelForm({ model }: EditModelFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTier, setSelectedTier] = useState<ModelTier>(
    model.modelTier || "NEW_CREATOR"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("id", model.id);
    formData.set("modelTier", selectedTier);

    const result = await updateModel(formData);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success("Model updated successfully!");
    setIsLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={model.name}
            placeholder="Enter model name"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={model.email}
            placeholder="model@mapmgt.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">New Password (optional)</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Leave blank to keep current password"
            minLength={6}
            disabled={isLoading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Minimum 6 characters. Leave blank to keep the current password.
        </p>
      </div>

      {/* Model Tier */}
      <div className="space-y-3">
        <Label>Model Tier</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(tierLabels) as ModelTier[]).map((tier) => {
            const { label, description, icon: Icon } = tierLabels[tier];
            const isSelected = selectedTier === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setSelectedTier(tier)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/10" : "bg-secondary"}`}>
                    <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          New Creators have access to the Guidance tab with training resources.
        </p>
      </div>

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
