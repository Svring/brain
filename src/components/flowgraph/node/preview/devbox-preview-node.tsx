"use client";

import React from "react";
import { Package } from "lucide-react";
import { BaseNodeContent } from "@/components/base-node";
import PreviewNodeWrapper from "./preview-node-wrapper";
import PreviewNodeTitle from "./preview-node-title";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { DevBox } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface DevboxPreviewNodeProps {
  data: DevBox;
}

export default function DevboxPreviewNode({ data }: DevboxPreviewNodeProps) {
  const { name, runtime, ports } = data;
  const target = convertResourceTypeToTarget("devbox", name);

  return (
    <PreviewNodeWrapper nodeId={`devbox-preview-${name}`} target={target}>
      <div className="flex flex-col gap-y-2">
        <PreviewNodeTitle name={name} target={target} />

        {/* Runtime */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">runtime:</span>
          <span className="text-sm text-foreground">{runtime}</span>
        </div>
      </div>
    </PreviewNodeWrapper>
  );
}
