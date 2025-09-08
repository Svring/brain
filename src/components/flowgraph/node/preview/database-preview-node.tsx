"use client";

import React from "react";
import { Database } from "lucide-react";
import { BaseNode, BaseNodeContent, BaseNodeHeader, BaseNodeHeaderTitle } from "@/components/base-node";
import { Badge } from "@/components/ui/badge";
import type { Database as DatabaseType } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface DatabasePreviewNodeProps {
  data: DatabaseType;
}

export default function DatabasePreviewNode({ data }: DatabasePreviewNodeProps) {
  const { name, type } = data;

  return (
    <BaseNode className="w-64 min-h-[120px] bg-card border-border">
      <BaseNodeHeader>
        <BaseNodeHeaderTitle className="text-sm font-semibold">
          {name}
        </BaseNodeHeaderTitle>
        <Badge variant="secondary" className="text-xs">
          Database
        </Badge>
      </BaseNodeHeader>
      
      <BaseNodeContent className="space-y-2">
        {/* Database Type */}
        <div className="flex items-center gap-2">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Type: <span className="text-foreground">{type}</span>
          </span>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
}
