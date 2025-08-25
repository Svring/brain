"use client";

import BaseNode from "../../base-node-wrapper";
import NodeStack from "../../components/node-stack";
import { cn } from "@/lib/utils";
import { Network, Globe, HelpCircle } from "lucide-react";
import type { DevboxPort } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export default function NetworkNode({
  data,
}: {
  data: {
    target: CustomResourceTarget | BuiltinResourceTarget;
  };
}) {
  const { target } = data;

  // Use the resource status hook to get the resource data
  const { resource, isLoading, error } = useResourceStatus(target);

  // Extract ports from the fetched resource - handle different resource types
  const ports = (() => {
    if (!resource) return [];

    // Handle different resource types that might have ports
    if ("ports" in resource && Array.isArray(resource.ports)) {
      return resource.ports;
    }

    // For builtin resources, check if they have ports in a different structure
    if (target.type === "builtin" && resource && typeof resource === "object") {
      // Try to find ports in various possible locations
      const possiblePorts =
        (resource as any).ports || (resource as any).spec?.ports || [];
      return Array.isArray(possiblePorts) ? possiblePorts : [];
    }

    return [];
  })();

  const { readyStatus, getBackgroundColor } = useNetworkStatus({ target });
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const handleNodeClick = () => {
    appendSystemMessage("universal.network", target);
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Execute only the specific icon action
    const statusData = readyStatus as any;
    const isNetworkNotReady = statusData?.data?.some(
      (item: any) => !item.ready
    );
    if (isNetworkNotReady) {
      appendSystemMessage("universal.diagnoseNetwork", target);
    }
  };

  const handleAddressClick = (
    e: React.MouseEvent,
    address: string,
    hasPublicAddress: boolean
  ) => {
    e.stopPropagation();
    // Execute only the address click action
    if (hasPublicAddress && address) {
      window.open(address, "_blank");
    }
  };

  // Show loading state if resource is still loading
  if (isLoading) {
    return (
      <BaseNode nodeData={data} className={cn("h-14 p-2", "bg-muted")}>
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </BaseNode>
    );
  }

  // Show error state if resource failed to load
  if (error || !resource) {
    return (
      <BaseNode
        nodeData={data}
        className={cn("h-14 p-2", "bg-status-error/20")}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-red-500">Error loading resource</div>
        </div>
      </BaseNode>
    );
  }

  // console.log("readyStatus", readyStatus);

  const mainCard = (
    <BaseNode nodeData={data} className={cn("h-14 p-2", getBackgroundColor())}>
      <div
        className="flex h-full flex-col justify-between cursor-pointer"
        onClick={handleNodeClick}
      >
        {/* Single Port Display */}
        <div className="flex items-center justify-center h-full">
          {ports.length > 0 ? (
            (() => {
              const port = ports[0];
              const hasPublicAddress = !!port.publicAddress;
              const address = port.publicAddress || port.privateAddress;

              // Check if network is not ready
              const statusData = readyStatus as any;
              const isNetworkNotReady = statusData?.data?.some(
                (item: any) => !item.ready
              );

              return (
                <div className="flex items-center justify-center gap-2 text-sm w-full">
                  {isNetworkNotReady ? (
                    <HelpCircle
                      className={cn(
                        "h-4 w-4 flex-shrink-0 cursor-help",
                        getBackgroundColor() === "bg-status-error/20"
                          ? "text-red-500"
                          : "text-yellow-500"
                      )}
                      onClick={handleIconClick}
                    />
                  ) : (
                    <Globe
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        hasPublicAddress
                          ? "text-theme-green"
                          : "text-theme-blue"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "truncate min-w-0",
                      hasPublicAddress
                        ? "text-foreground cursor-pointer hover:text-foreground/80"
                        : "text-foreground"
                    )}
                    onClick={(e) =>
                      handleAddressClick(e, address, hasPublicAddress)
                    }
                  >
                    {address}
                  </span>
                </div>
              );
            })()
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm w-full">
              <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">No ports available</span>
            </div>
          )}
        </div>
      </div>
    </BaseNode>
  );

  return (
    <NodeStack
      mainCard={mainCard}
      data={ports.length > 1 ? ports.slice(1) : []}
      height="14"
      backgroundColor={getBackgroundColor()}
    />
  );
}
