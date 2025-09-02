"use client";

import BaseNode from "../../base-node-wrapper";
import NodeStack from "../../components/node-stack";
import { cn } from "@/lib/utils";
import { Globe, HelpCircle, Copy, Check } from "lucide-react";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useCopy } from "@/hooks/use-copy";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useProjectActions } from "@/contexts/project/project-context";

export default function NetworkNode({
  data,
}: {
  data: {
    target: CustomResourceTarget | BuiltinResourceTarget;
  };
}) {
  const { target } = data;
  const { selectResource } = useProjectActions();
  // Construct node ID following the same pattern as other nodes
  const nodeId = `network-${target.name || target.resourceType}`;

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

  const { readyStatus, getBackgroundColor } = useNetworkStatus(target);
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const { copyToClipboard, isCopied } = useCopy();

  // console.log("readyStatus", readyStatus);

  // Extract network status data and prepare for NodeStack
  const networkData = (() => {
    const statusData = readyStatus as any;

    // Handle error case (code: 500) - ignore and return empty array
    if (statusData?.code === 500) {
      return [];
    }

    // Handle success case (code: 200) with data array
    if (statusData?.code === 200 && Array.isArray(statusData?.data)) {
      return statusData.data.map((item: any) => ({
        url: item.url,
        ready: item.ready,
        error: item.error,
      }));
    }

    return [];
  })();

  // Determine the front card URL and background card data
  const frontCardUrl = (() => {
    if (networkData.length === 0) {
      // Fallback to ports if no network data
      return ports.length > 0
        ? ports[0].publicAddress || ports[0].privateAddress
        : null;
    }

    // If all cards are ready, use the first item's URL
    const allReady = networkData.every((item: any) => item.ready);
    if (allReady) {
      return networkData[0]?.url;
    }

    // If some cards are not ready, use the first error card's URL
    const firstErrorCard = networkData.find((item: any) => !item.ready);
    return firstErrorCard?.url || networkData[0]?.url;
  })();

  // Prepare background card data (length - 1 as requested)
  const backgroundCardData = networkData.length > 1 ? networkData.slice(1) : [];

  // Count not ready items for color configuration
  const notReadyCount = networkData.filter((item: any) => !item.ready).length;

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Execute only the specific icon action
    const statusData = readyStatus as any;
    const isNetworkNotReady = statusData?.data?.some(
      (item: any) => !item.ready
    );
    if (isNetworkNotReady) {
      selectResource(target);
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

  const handleCopyClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    copyToClipboard(url, `network-${target.name || target.resourceType}`);
  };

  // Show loading state if resource is still loading
  if (isLoading) {
    return (
      <BaseNode nodeId={nodeId} className={cn("h-14 p-2", "bg-muted")}>
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
        nodeId={nodeId}
        className={cn("h-14 p-2", "bg-status-error/20")}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-theme-red">Error loading resource</div>
        </div>
      </BaseNode>
    );
  }

  // console.log("readyStatus", readyStatus);

  const mainCard = (
    <BaseNode
      target={target}
      nodeId={nodeId}
      messageType="universal.network"
      className={cn("h-14 p-2", getBackgroundColor())}
    >
      <div className="flex h-full flex-col justify-between cursor-pointer">
        {/* Single Port Display */}
        <div className="flex items-center justify-center h-full">
          {frontCardUrl ? (
            (() => {
              const hasPublicAddress = frontCardUrl.startsWith("http");
              const isNetworkNotReady = notReadyCount > 0;

              return (
                <div className="flex items-center justify-center gap-2 text-sm w-full">
                  {isNetworkNotReady ? (
                    <HelpCircle
                      className={cn(
                        "h-4 w-4 flex-shrink-0 cursor-help",
                        "text-yellow-500"
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
                      "truncate min-w-0 flex-1",
                      hasPublicAddress
                        ? "text-foreground cursor-pointer hover:text-foreground/80"
                        : "text-foreground"
                    )}
                    onClick={(e) =>
                      handleAddressClick(e, frontCardUrl, hasPublicAddress)
                    }
                  >
                    {frontCardUrl}
                  </span>
                  <button
                    className={cn(
                      "h-4 w-4 flex-shrink-0 p-0.5 rounded hover:bg-muted/50 transition-colors",
                      isCopied(`network-${target.name || target.resourceType}`)
                        ? "text-green-500"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={(e) => handleCopyClick(e, frontCardUrl)}
                  >
                    {isCopied(
                      `network-${target.name || target.resourceType}`
                    ) ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
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
      data={backgroundCardData}
      height="14"
      // backgroundColor={getBackgroundColor()}
      notReadyCount={notReadyCount}
      target={target}
      messageType="universal.network"
    />
  );
}
