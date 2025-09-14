"use client";

import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages/components/base-resource-message";
import ClusterUpdateResource from "./cluster-update-resource";

interface ClusterUpdateMessageProps {
  target: CustomResourceTarget;
}

export default function ClusterUpdateMessage({
  target,
}: ClusterUpdateMessageProps) {
  return (
    <BaseResourceMessage target={target}>
      <ClusterUpdateResource target={target} />
    </BaseResourceMessage>
  );
}
