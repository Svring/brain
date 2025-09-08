"use client";

import React from "react";
import PreviewNodeWrapper from "./preview-node-wrapper";
import PreviewNodeTitle from "./preview-node-title";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { App } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface AppPreviewNodeProps {
  data: App;
}

export default function AppPreviewNode({ data }: AppPreviewNodeProps) {
  const { name, image, ports, env } = data;
  const target = convertResourceTypeToTarget("deployment", name);

  return (
    <PreviewNodeWrapper nodeId={`app-preview-${name}`} target={target}>
      <div className="flex flex-col gap-y-2">
        <PreviewNodeTitle name={name} target={target} />

        {/* Image */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">image:</span>
          <span className="text-sm text-foreground truncate">
            {image.split('/').pop()?.split(':')[0] || image}
          </span>
        </div>

        {/* Ports */}
        {ports && ports.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {ports.map(port => `${port.number}${port.publicAccess ? '*' : ''}`).join(', ')}
          </div>
        )}

        {/* Environment Variables */}
        {env && env.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {env.length} env vars
          </div>
        )}
      </div>
    </PreviewNodeWrapper>
  );
}
