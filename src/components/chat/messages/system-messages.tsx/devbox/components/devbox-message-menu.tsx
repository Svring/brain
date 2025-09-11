"use client";

import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import DevboxIconButtons from "./universal/devbox-icon-buttons";

interface DevboxMessageMenuProps {
  target: CustomResourceTarget;
}

export default function DevboxMessageMenu({ target }: DevboxMessageMenuProps) {
  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const devboxName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  // Create a DevboxObject from the target
  const devboxObject = {
    name: devboxName,
    status: currentStatus,
    // Add other required properties if needed
  } as DevboxObject;

  // Don't render if we don't have a valid devbox name
  if (!devboxName) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <DevboxIconButtons
        object={devboxObject}
        onDelete={(devboxName) => {
          // Handle delete callback if needed
          console.log("Delete devbox:", devboxName);
        }}
      />
    </div>
  );
}
