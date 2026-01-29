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
import { Loader2, Save, MessageSquare, Users, Globe, Check } from "lucide-react";
import { createScript, updateScript } from "@/lib/actions/content";
import { toast } from "sonner";
import { ScriptCategory } from "@prisma/client";
import { scriptCategoryLabels } from "@/lib/utils";

interface ScriptFormProps {
  models: Array<{ id: string; name: string; email: string }>;
  script?: {
    id: string;
    title: string;
    description: string | null;
    scriptContent: string | null;
    scriptCategory: ScriptCategory | null;
    isGlobal: boolean;
    assignedModels: string[];
  };
}

export function ScriptForm({ models, script }: ScriptFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGlobal, setIsGlobal] = useState(script?.isGlobal ?? true);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(
    new Set(script?.assignedModels ?? [])
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("isGlobal", isGlobal.toString());
    
    // Clear and re-add selected models
    formData.delete("assignedModels");
    selectedModels.forEach((id) => formData.append("assignedModels", id));

    const action = script ? updateScript : createScript;
    if (script) {
      formData.append("id", script.id);
    }

    const result = await action(formData);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success(script ? "Script updated!" : "Script created!");
    router.push("/admin/content/scripts");
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
          <MessageSquare className="h-4 w-4" />
          Script Information
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={script?.title}
              placeholder="e.g., Welcome Message"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scriptCategory">Category *</Label>
            <Select name="scriptCategory" defaultValue={script?.scriptCategory || ""} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(scriptCategoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            name="description"
            defaultValue={script?.description || ""}
            placeholder="Brief description of when to use this script..."
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Script Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          Script Content
        </div>

        <div className="space-y-2">
          <Label htmlFor="scriptContent">Script Text *</Label>
          <Textarea
            id="scriptContent"
            name="scriptContent"
            defaultValue={script?.scriptContent || ""}
            placeholder="Write the script content here...

Example:
Hey! I noticed you just subscribed 💕 Thanks for being here! What made you decide to join?"
            required
            disabled={isLoading}
            className="min-h-[200px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Write the script exactly as models should use it. Include emojis if desired.
          </p>
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
                  Every model will see this script
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
              {script ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {script ? "Update Script" : "Create Script"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
