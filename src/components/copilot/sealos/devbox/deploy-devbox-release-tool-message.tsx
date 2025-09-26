"use client";

import React from "react";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { DeploymentChart } from "@/components/chat/messages/system-messages/components/deployment-chart";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import type { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";

interface DeployDevboxReleaseToolMessageProps {
  result: ToolActionResult;
}

export const DeployDevboxReleaseToolMessage: React.FC<
  DeployDevboxReleaseToolMessageProps
> = ({ result }) => {
  // Construct CustomResourceTarget from devbox_name
  const target = convertResourceTypeToTarget(
    "devbox",
    result.payload.devbox_name
  ) as CustomResourceTarget;

  return (
    <div className="w-full border border-border-primary rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">
          Deploy {result.payload.release_tag} to...
        </h3>
      </div>
      <DeploymentChart
        target={target}
        payload={{ tag: result.payload.release_tag }}
      />
    </div>
  );
};
