"use client";

import { useEffect } from "react";
import BaseNode from "../../base-node-wrapper";
import NodeStack from "../../components/node-stack";
import { cn } from "@/lib/utils";
import { Globe, HelpCircle, Copy, Check } from "lucide-react";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useCopy } from "@/hooks/use-copy";
import { useDiagnoseNetwork } from "@/hooks/copilot/use-analyze-network";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

type NetworkNodeProps = {
  data: { target: CustomResourceTarget | BuiltinResourceTarget };
};

export default function NetworkNode({ data }: NetworkNodeProps) {
  const { target } = data;
  const nodeId = `network-${target.name || target.resourceType}`;
  const { resource, isLoading, error } = useResourceStatus(target);
  const { readyStatus, getBackgroundColor } = useNetworkStatus(target);
  const { copyToClipboard, isCopied } = useCopy();
  const { diagnoseNetwork } = useDiagnoseNetwork(target);

  // Extract ports from resource
  const ports = (resource as any)?.ports;

  // Extract network data
  const networkData = Array.isArray(readyStatus)
    ? readyStatus.map((item: any) => ({
        url: item.url,
        ready: item.ready,
        error: item.error,
      }))
    : [];

  // Determine front card URL and type
  let frontCardUrl: string | null = null;
  let frontCardType: "public" | "private" | null = null;

  if (networkData.length > 0) {
    // Use network status data if available
    const notReadyItem = networkData.find((item: any) => !item.ready);
    if (notReadyItem) {
      frontCardUrl = notReadyItem.url;
      frontCardType = "public"; // Network status URLs are typically public
    } else {
      frontCardUrl = networkData[0]?.url;
      frontCardType = "public";
    }
  } else if (ports && ports.length > 0) {
    // Check ports for public address first, then private address
    const port = ports[0];
    if (port.publicAddress) {
      frontCardUrl = port.publicAddress;
      frontCardType = "public";
    } else if (port.privateAddress) {
      frontCardUrl = port.privateAddress;
      frontCardType = "private";
    }
  }

  const notReadyCount = networkData.filter((item: any) => !item.ready).length;

  // Create background card data from ports only
  const backgroundCardData: any[] = [];

  // Add additional ports (beyond the first one used for main card)
  if (ports && ports.length > 1) {
    const additionalPorts = ports.slice(1);
    additionalPorts.forEach((port: any) => {
      const portUrl = port.publicAddress || port.privateAddress;
      if (portUrl) {
        backgroundCardData.push({
          url: portUrl,
          ready: true, // Ports are considered ready by default
          error: undefined,
        });
      }
    });
  }

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (notReadyCount > 0) {
      diagnoseNetwork(readyStatus);
    }
  };

  const handleAddressClick = (
    e: React.MouseEvent,
    address: string,
    addressType: "public" | "private"
  ) => {
    e.stopPropagation();
    e.preventDefault();
    // Only allow opening public addresses
    if (addressType === "public" && address.startsWith("http")) {
      window.open(address, "_blank");
    }
  };

  const handleCopyClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    e.preventDefault();
    copyToClipboard(url, nodeId);
  };

  // Listen for custom event to trigger network analysis from edge clicks
  useEffect(() => {
    const handleNetworkAnalysisEvent = (event: CustomEvent) => {
      const { target: eventTarget, nodeId: eventNodeId } = event.detail;

      // Check if this event is for this specific network node
      if (
        eventNodeId === nodeId &&
        eventTarget &&
        JSON.stringify(eventTarget) === JSON.stringify(target)
      ) {
        // Trigger network analysis if there are network issues
        if (notReadyCount > 0) {
          diagnoseNetwork(readyStatus);
        }
      }
    };

    window.addEventListener(
      "triggerNetworkAnalysis",
      handleNetworkAnalysisEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "triggerNetworkAnalysis",
        handleNetworkAnalysisEvent as EventListener
      );
    };
  }, [nodeId, target, notReadyCount, readyStatus]);

  if (isLoading) {
    return (
      <BaseNode
        target={target}
        nodeId={nodeId}
        messageType="universal.network"
        className="h-14 p-2 bg-muted"
        width="auto"
        view="network"
      >
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Loading...
        </div>
      </BaseNode>
    );
  }

  if (error || !resource) {
    return (
      <BaseNode
        target={target}
        nodeId={nodeId}
        messageType="universal.network"
        className="h-14 p-2 bg-status-error/20"
        width="auto"
        view="network"
      >
        <div className="flex items-center justify-center h-full text-sm text-theme-red">
          Error loading resource
        </div>
      </BaseNode>
    );
  }

  // Determine message type based on target resource type
  const messageType =
    target.resourceType === "devbox"
      ? "devbox.network"
      : target.resourceType === "deployment" ||
        target.resourceType === "statefulset"
      ? "launchpad.network"
      : "universal.network";

  const mainCard = (
    <BaseNode
      target={target}
      nodeId={nodeId}
      messageType={messageType}
      className={cn("h-14 p-2", getBackgroundColor())}
      view="network"
      // width="auto"
    >
      <div className="flex items-center justify-center h-full">
        {frontCardUrl ? (
          <div className="flex items-center justify-center gap-2 text-sm w-full">
            {notReadyCount > 0 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="h-4 w-4 cursor-help text-theme-yellow"
                      onClick={handleIconClick}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Diagnose network issues with AI</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Globe
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        frontCardType === "public"
                          ? "text-theme-green"
                          : "text-theme-blue"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>
                      {frontCardType === "public"
                        ? "Accessible on public network"
                        : "Cluster-range access only"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <span
              className={cn(
                "truncate min-w-0 flex-1",
                frontCardType === "public" &&
                  "cursor-pointer hover:text-foreground/80"
              )}
              onClick={(e) =>
                handleAddressClick(e, frontCardUrl, frontCardType || "private")
              }
            >
              {frontCardUrl}
            </span>
            <button
              className={cn(
                "h-4 w-4 flex-shrink-0 p-0.5 rounded hover:bg-muted/50 transition-colors",
                isCopied(nodeId) ? "text-green-500" : "text-muted-foreground"
              )}
              onClick={(e) => handleCopyClick(e, frontCardUrl)}
            >
              {isCopied(nodeId) ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm w-full">
            <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">No ports available</span>
          </div>
        )}
      </div>
    </BaseNode>
  );

  return (
    <NodeStack
      mainCard={mainCard}
      data={backgroundCardData}
      height="14"
      notReadyCount={notReadyCount}
      target={target}
      messageType={messageType}
      nodeId={nodeId}
      width="auto"
    />
  );
}
