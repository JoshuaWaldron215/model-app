import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users } from "lucide-react";
import { getInitials, formatDate, userStatusLabels } from "@/lib/utils";
import { ModelActions } from "@/components/admin/model-actions";
import { CreateModelDialog } from "@/components/admin/create-model-dialog";
import { getAllModels } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const models = await getAllModels();

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Models</h1>
          <p className="text-muted-foreground mt-1">
            Manage your model accounts and access
          </p>
        </div>
        <CreateModelDialog>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Model
          </Button>
        </CreateModelDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{models.length}</p>
                <p className="text-sm text-muted-foreground">Total Models</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {models.filter((m) => m.status === "ACTIVE").length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <Users className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {models.filter((m) => m.status === "SUSPENDED").length}
                </p>
                <p className="text-sm text-muted-foreground">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Models List */}
      <Card>
        <CardHeader>
          <CardTitle>All Models</CardTitle>
        </CardHeader>
        <CardContent>
          {models.length > 0 ? (
            <div className="space-y-3">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      {model.avatarUrl && (
                        <AvatarImage src={model.avatarUrl} alt={model.name} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(model.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {model.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{model._count.contentAssignments} content items</span>
                      <span>Joined {formatDate(model.createdAt)}</span>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={
                        model.status === "ACTIVE"
                          ? "success"
                          : model.status === "SUSPENDED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {userStatusLabels[model.status]}
                    </Badge>

                    {/* Actions */}
                    <ModelActions model={model} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No models yet</h3>
              <p className="text-muted-foreground mt-1">
                Add your first model to get started
              </p>
              <CreateModelDialog>
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Model
                </Button>
              </CreateModelDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
