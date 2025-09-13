"use client";

import React from "react";
import { Network } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";

interface NetworkSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

export const NetworkSection: React.FC<NetworkSectionProps> = ({ target, onSectionClick }) => {
  const { resource: devboxObject } = useResourceStatus(target);
  const portsCount = devboxObject?.ports?.length || 0;

  return (
    <div 
      className="p-2 bg-background-tertiary rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Network</span>
          <span className="text-xs text-muted-foreground">{portsCount} ports</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkSection;