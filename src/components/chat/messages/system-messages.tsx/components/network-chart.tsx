import React from "react";
import type {
  DevboxObject,
} from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { PortDisplayTable } from "@/components/chat/messages/system-messages.tsx/components/port-display-table";

interface NetworkChartProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const NetworkChart: React.FC<NetworkChartProps> = ({ target }) => {
  const { resource } = useResourceStatus(target);
  const ports = (resource as DevboxObject)?.ports || [];

  if (!resource || !ports || ports.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <PortDisplayTable ports={ports} />
    </div>
  );
};

export default NetworkChart;
