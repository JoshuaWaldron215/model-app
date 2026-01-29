import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { scriptCategoryLabels } from "@/lib/utils";
import { ScriptCard } from "@/components/model/script-card";
import { getModelScripts } from "@/lib/cache";

export default async function ModelScriptsPage() {
  const session = await auth();
  const scripts = await getModelScripts(session!.user.id);

  // Group by category
  const categorizedScripts = scripts.reduce((acc, script) => {
    const category = script.scriptCategory || "OTHER";
    if (!acc[category]) acc[category] = [];
    acc[category].push(script);
    return acc;
  }, {} as Record<string, typeof scripts>);

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scripts</h1>
        <p className="text-muted-foreground mt-1">
          Chat and messaging script inspirations
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success">
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium">{scripts.length} scripts</span>
        </div>
      </div>

      {/* Content */}
      {scripts.length > 0 ? (
        <div className="space-y-10">
          {Object.entries(scriptCategoryLabels).map(([category, label]) => {
            const categoryScripts = categorizedScripts[category];
            if (!categoryScripts?.length) return null;

            return (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Badge 
                    variant="secondary"
                    className={
                      category === "ICE_BREAKER" ? "bg-blue-500/10 text-blue-500" :
                      category === "UPSELL" ? "bg-green-500/10 text-green-500" :
                      category === "RETENTION" ? "bg-purple-500/10 text-purple-500" :
                      category === "RE_ENGAGEMENT" ? "bg-orange-500/10 text-orange-500" :
                      ""
                    }
                  >
                    {label}
                  </Badge>
                  <span className="text-sm font-normal text-muted-foreground">
                    {categoryScripts.length} {categoryScripts.length === 1 ? "script" : "scripts"}
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryScripts.map((script) => (
                    <ScriptCard key={script.id} script={script} />
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
                Check back later for new script inspirations
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
