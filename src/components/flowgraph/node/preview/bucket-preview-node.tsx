"use client";

import React from "react";
import { FolderOpen } from "lucide-react";
import { BaseNode, BaseNodeContent, BaseNodeHeader, BaseNodeHeaderTitle } from "@/components/base-node";
import { Badge } from "@/components/ui/badge";
import type { ObjectStorageBucket } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface BucketPreviewNodeProps {
  data: ObjectStorageBucket;
}

export default function BucketPreviewNode({ data }: BucketPreviewNodeProps) {
  const { name, policy } = data;

  const getPolicyLabel = (policy: string) => {
    switch (policy) {
      case "private":
        return "Private";
      case "publicRead":
        return "Public Read";
      case "publicReadWrite":
        return "Public Read/Write";
      default:
        return policy;
    }
  };

  return (
    <BaseNode className="w-64 min-h-[120px] bg-card border-border">
      <BaseNodeHeader>
        <BaseNodeHeaderTitle className="text-sm font-semibold">
          {name}
        </BaseNodeHeaderTitle>
        <Badge variant="secondary" className="text-xs">
          Storage
        </Badge>
      </BaseNodeHeader>
      
      <BaseNodeContent className="space-y-2">
        {/* Bucket Policy */}
        <div className="flex items-center gap-2">
          <FolderOpen className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Policy: <span className="text-foreground">{getPolicyLabel(policy)}</span>
          </span>
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
}
