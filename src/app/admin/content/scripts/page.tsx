import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Globe, Users } from "lucide-react";
import { formatDate, scriptCategoryLabels } from "@/lib/utils";
import Link from "next/link";
import { ContentActions } from "@/components/admin/content-actions";
import { getScripts } from "@/lib/cache";

export default async function ScriptsPage() {
  const scripts = await getScripts();

  // Group by category
  const categorizedScripts = scripts.reduce((acc, script) => {
    const category = script.scriptCategory || "OTHER";
    if (!acc[category]) acc[category] = [];
    acc[category].push(script);
    return acc;
  }, {} as Record<string, typeof scripts>);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scripts</h1>
          <p className="text-muted-foreground mt-1">
            Manage sexting script inspirations for your models
          </p>
        </div>
        <Link href="/admin/content/scripts/new" prefetch={true}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Script
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <MessageSquare className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scripts.length}</p>
                <p className="text-sm text-muted-foreground">Total Scripts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {["ICE_BREAKER", "UPSELL", "RETENTION"].map((cat) => (
          <Card key={cat}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {categorizedScripts[cat]?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {scriptCategoryLabels[cat]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scripts by Category */}
      {scripts.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(scriptCategoryLabels).map(([category, label]) => {
            const categoryScripts = categorizedScripts[category];
            if (!categoryScripts?.length) return null;

            return (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {label}
                  <Badge variant="secondary" className="ml-2">
                    {categoryScripts.length}
                  </Badge>
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryScripts.map((script) => (
                    <Card
                      key={script.id}
                      className={`transition-all hover:shadow-lg ${
                        !script.isActive ? "opacity-60" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{script.title}</h3>
                              {!script.isActive && (
                                <Badge variant="destructive" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            {script.scriptContent && (
                              <p className="text-sm text-muted-foreground line-clamp-3 mt-2 whitespace-pre-wrap">
                                {script.scriptContent}
                              </p>
                            )}
                          </div>
                          <ContentActions content={script} type="script" />
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                          {script.isGlobal ? (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" /> All models
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {script.assignments.length} models
                            </span>
                          )}
                          <span>•</span>
                          <span>{formatDate(script.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No scripts yet</h3>
              <p className="text-muted-foreground mt-1">
                Add your first script inspiration to get started
              </p>
              <Link href="/admin/content/scripts/new">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Script
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
