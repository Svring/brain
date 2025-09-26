"use client";

import React from "react";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { ReleaseChart } from "@/components/chat/messages/system-messages/components/release-chart";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import type { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";

interface GetDevboxReleaseToolMessageProps {
  result: ToolActionResult;
}

export const GetDevboxReleaseToolMessage: React.FC<
  GetDevboxReleaseToolMessageProps
> = ({ result }) => {
  // Construct CustomResourceTarget from devbox_name
  const target = convertResourceTypeToTarget(
    "devbox",
    result.payload.devbox_name
  ) as CustomResourceTarget;

  return (
    <div className="w-full border border-border-primary rounded-lg p-4">
      <ReleaseChart target={target} />
    </div>
  );
};
