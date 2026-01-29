"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { ScriptCategory } from "@prisma/client";
import { scriptCategoryLabels } from "@/lib/utils";

interface ScriptCardProps {
  script: {
    id: string;
    title: string;
    description: string | null;
    scriptContent: string | null;
    scriptCategory: ScriptCategory | null;
  };
}

export function ScriptCard({ script }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function copyToClipboard() {
    if (!script.scriptContent) return;
    
    await navigator.clipboard.writeText(script.scriptContent);
    setCopied(true);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  const isLong = (script.scriptContent?.length || 0) > 200;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold">{script.title}</h3>
            {script.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {script.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {script.scriptContent && (
          <div className="relative">
            <div
              className={`p-4 rounded-lg bg-secondary/30 text-sm whitespace-pre-wrap font-mono ${
                !expanded && isLong ? "max-h-32 overflow-hidden" : ""
              }`}
            >
              {script.scriptContent}
            </div>
            
            {!expanded && isLong && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
            )}
            
            {isLong && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="w-full mt-2"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
