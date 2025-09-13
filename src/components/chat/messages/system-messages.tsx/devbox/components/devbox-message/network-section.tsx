"use client";

import React from "react";
import { Network } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { NetworkChart } from "../../../components/network-chart";

interface NetworkSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// Network Popover Content Component
export const NetworkPopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  return (
    <div className="w-full rounded-lg">
      <NetworkChart target={target} />
    </div>
  );
};

export const NetworkSection: React.FC<NetworkSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: devboxObject } = useResourceStatus(target);
  const portsCount = devboxObject?.ports?.length || 0;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Network</span>
          <span className="text-xs text-muted-foreground">
            {portsCount} ports
          </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkSection;
