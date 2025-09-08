"use client";

import React from "react";
import { Rocket } from "lucide-react";
import { BaseNode, BaseNodeContent, BaseNodeHeader, BaseNodeHeaderTitle } from "@/components/base-node";
import { Badge } from "@/components/ui/badge";
import type { App } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface AppPreviewNodeProps {
  data: App;
}

export default function AppPreviewNode({ data }: AppPreviewNodeProps) {
  const { name, image, ports, env } = data;

  return (
    <BaseNode className="w-64 min-h-[120px] bg-card border-border">
      <BaseNodeHeader>
        <BaseNodeHeaderTitle className="text-sm font-semibold">
          {name}
        </BaseNodeHeaderTitle>
        <Badge variant="secondary" className="text-xs">
          App
        </Badge>
      </BaseNodeHeader>
      
      <BaseNodeContent className="space-y-2">
        {/* Image */}
        <div className="flex items-center gap-2">
          <Rocket className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Image: <span className="text-foreground">{image}</span>
          </span>
        </div>

        {/* Ports */}
        {ports && ports.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Ports: {ports.map(port => `${port.number}${port.publicAccess ? ' (public)' : ''}`).join(', ')}
          </div>
        )}

        {/* Environment Variables */}
        {env && env.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Env vars: {env.length} configured
          </div>
        )}
      </BaseNodeContent>
    </BaseNode>
  );
}
