"use client";

import React from "react";
import PreviewNodeWrapper from "./preview-node-wrapper";
import PreviewNodeTitle from "./preview-node-title";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { Database as DatabaseType } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface DatabasePreviewNodeProps {
  data: DatabaseType;
}

export default function DatabasePreviewNode({ data }: DatabasePreviewNodeProps) {
  const { name, type } = data;
  const target = convertResourceTypeToTarget("cluster", name);

  return (
    <PreviewNodeWrapper nodeId={`database-preview-${name}`} target={target}>
      <div className="flex flex-col gap-y-2">
        <PreviewNodeTitle name={name} target={target} />

        {/* Database Type */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">type:</span>
          <span className="text-sm text-foreground">{type}</span>
        </div>
      </div>
    </PreviewNodeWrapper>
  );
}
