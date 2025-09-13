"use client";

import React from "react";
import { Network } from "lucide-react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";

interface NetworkSectionProps {
  target: BuiltinResourceTarget;
  onSectionClick: () => void;
}

// Network Popover Content Component
export const NetworkPopoverContent: React.FC<{
  target: BuiltinResourceTarget;
}> = ({ target }) => {
  const { resource: launchpadResource } = useResourceStatus(target);
  const parsedLaunchpadObject = launchpadResource
    ? LaunchpadObjectSchema.parse(launchpadResource)
    : null;

  const ports = parsedLaunchpadObject?.ports || [];
  const portsCount = ports.length;

  return (
    <div className="w-full rounded-lg">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Network Ports</h3>
          <span className="text-sm text-muted-foreground">
            {portsCount} port{portsCount !== 1 ? "s" : ""}
          </span>
        </div>
        
        {portsCount > 0 ? (
          <div className="space-y-2">
            {ports.map((port, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-background-tertiary rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {port.name || `Port ${port.port}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {port.port}
                  </span>
                  {port.targetPort && port.targetPort !== port.port && (
                    <span className="text-xs text-muted-foreground">
                      → {port.targetPort}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Network className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No network ports configured
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const NetworkSection: React.FC<NetworkSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: launchpadResource } = useResourceStatus(target);
  const parsedLaunchpadObject = launchpadResource
    ? LaunchpadObjectSchema.parse(launchpadResource)
    : null;

  const portsCount = parsedLaunchpadObject?.ports?.length || 0;

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
            {portsCount} port{portsCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NetworkSection;
