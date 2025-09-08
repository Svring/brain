"use client";

import React from "react";
import PreviewNodeWrapper from "./preview-node-wrapper";
import PreviewNodeTitle from "./preview-node-title";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { ObjectStorageBucket } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface BucketPreviewNodeProps {
  data: ObjectStorageBucket;
}

export default function BucketPreviewNode({ data }: BucketPreviewNodeProps) {
  const { name, policy } = data;
  const target = convertResourceTypeToTarget("objectstoragebucket", name);

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
    <PreviewNodeWrapper nodeId={`bucket-preview-${name}`} target={target}>
      <div className="flex flex-col gap-y-2">
        <PreviewNodeTitle name={name} target={target} />

        {/* Bucket Policy */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">policy:</span>
          <span className="text-sm text-foreground">{getPolicyLabel(policy)}</span>
        </div>
      </div>
    </PreviewNodeWrapper>
  );
}
