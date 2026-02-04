"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { createPool, updatePool } from "@/lib/actions/pool";
import { toast } from "sonner";

interface PoolFormProps {
  pool?: {
    id: string;
    date: Date;
    title: string;
    isActive: boolean;
  };
}

export function PoolForm({ pool }: PoolFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(pool?.isActive ?? true);

  // Format date for input
  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // Default to today for new pools
  const defaultDate = pool
    ? formatDateForInput(pool.date)
    : formatDateForInput(new Date());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("isActive", isActive.toString());

    if (pool) {
      formData.append("id", pool.id);
    }

    if (pool) {
      const result = await updatePool(formData);
      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }
      toast.success("Pool updated!");
      router.refresh();
    } else {
      const result = await createPool(formData);
      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }
      toast.success("Pool created!");
      if (result.poolId) {
        router.push(`/admin/pool/${result.poolId}`);
      }
    }
    
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultDate}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            The date this pool is for
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={pool?.title}
            placeholder="e.g., Monday Dance Trends"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {pool && (
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="space-y-0.5">
            <Label>Active</Label>
            <p className="text-sm text-muted-foreground">
              Inactive pools won&apos;t be shown to models
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={isLoading}
          />
        </div>
      )}

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
              {pool ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {pool ? "Save Changes" : "Create Pool"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
