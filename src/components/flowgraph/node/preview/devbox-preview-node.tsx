"use client";

import React from "react";
import { Package } from "lucide-react";
import { BaseNode, BaseNodeContent, BaseNodeHeader, BaseNodeHeaderTitle } from "@/components/base-node";
import { Badge } from "@/components/ui/badge";
import type { DevBox } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface DevboxPreviewNodeProps {
  data: DevBox;
}

export default function DevboxPreviewNode({ data }: DevboxPreviewNodeProps) {
  const { name, runtime, ports } = data;

  return (
    <BaseNode className="w-64 min-h-[120px] bg-card border-border">
      <BaseNodeHeader>
        <BaseNodeHeaderTitle className="text-sm font-semibold">
          {name}
        </BaseNodeHeaderTitle>
        <Badge variant="secondary" className="text-xs">
          DevBox
        </Badge>
      </BaseNodeHeader>
      
      <BaseNodeContent className="space-y-2">
        {/* Runtime */}
        <div className="flex items-center gap-2">
          <Package className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Runtime: <span className="text-foreground">{runtime}</span>
          </span>
        </div>

        {/* Ports */}
        {ports && ports.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Ports: {ports.map(port => `${port.number}${port.publicAccess ? ' (public)' : ''}`).join(', ')}
          </div>
        )}
      </BaseNodeContent>
    </BaseNode>
  );
}
