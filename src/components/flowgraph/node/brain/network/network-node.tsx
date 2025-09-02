"use client";

import BaseNode from "../../base-node-wrapper";
import NodeStack from "../../components/node-stack";
import { cn } from "@/lib/utils";
import { Globe, HelpCircle, Copy, Check } from "lucide-react";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useCopy } from "@/hooks/use-copy";
import { useProjectActions } from "@/contexts/project/project-context";
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
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const { selectResource } = useProjectActions();
  const { copyToClipboard, isCopied } = useCopy();

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

  // Determine front card URL
  const frontCardUrl =
    networkData.length > 0
      ? networkData.find((item: any) => !item.ready)?.url || networkData[0]?.url
      : ports[0]?.publicAddress || ports[0]?.privateAddress || null;

  const notReadyCount = networkData.filter((item: any) => !item.ready).length;
  const backgroundCardData = networkData.slice(1);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (notReadyCount > 0) {
      selectResource(target);
      appendSystemMessage("universal.diagnoseNetwork", target);
    }
  };

  const handleAddressClick = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (address.startsWith("http")) {
      window.open(address, "_blank");
    }
  };

  const handleCopyClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    e.preventDefault();
    copyToClipboard(url, nodeId);
  };

  if (isLoading) {
    return (
      <BaseNode nodeId={nodeId} className="h-14 p-2 bg-muted">
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Loading...
        </div>
      </BaseNode>
    );
  }

  if (error || !resource) {
    return (
      <BaseNode nodeId={nodeId} className="h-14 p-2 bg-status-error/20">
        <div className="flex items-center justify-center h-full text-sm text-theme-red">
          Error loading resource
        </div>
      </BaseNode>
    );
  }

  const mainCard = (
    <BaseNode
      target={target}
      nodeId={nodeId}
      messageType="universal.network"
      className={cn("h-14 p-2", getBackgroundColor())}
    >
      <div className="flex items-center justify-center h-full">
        {frontCardUrl ? (
          <div className="flex items-center justify-center gap-2 text-sm w-full">
            {notReadyCount > 0 ? (
              <HelpCircle
                className="h-4 w-4 flex-shrink-0 cursor-help text-yellow-500"
                onClick={handleIconClick}
              />
            ) : (
              <Globe
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  frontCardUrl.startsWith("http")
                    ? "text-theme-green"
                    : "text-theme-blue"
                )}
              />
            )}
            <span
              className={cn(
                "truncate min-w-0 flex-1",
                frontCardUrl.startsWith("http") &&
                  "cursor-pointer hover:text-foreground/80"
              )}
              onClick={(e) => handleAddressClick(e, frontCardUrl)}
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
      messageType="universal.network"
    />
  );
}
