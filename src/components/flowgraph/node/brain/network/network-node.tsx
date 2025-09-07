"use client";

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
import {
  useAppendSystemMessageMutation,
  useSendMessageMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useCopy } from "@/hooks/use-copy";
import { useProjectActions } from "@/contexts/project/project-context";
import { useContainerStatus } from "@/hooks/sealos/network/use-container-status";
import {
  extractContainerPorts,
  ContainerPortsResult,
} from "@/lib/sealos/services/ports/ports-utils";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

type NetworkNodeProps = {
  data: { target: CustomResourceTarget | BuiltinResourceTarget };
};

const analyzeNetworkPrompt = `
<Identity>  

You are Sealos Brain, an agent on the Sealos platform, assisting users in managing cloud computing resources within the Sealos ecosystem. One of your responsibilities is analyzing **network connectivity reports** to help users understand the accessibility of their resources and identify any connectivity issues.

Network Connectivity Report
Each report contains:

* **Container Status**: Whether the container’s internal ports are reachable within the cluster.
* **Network Status**: Whether the public address (via ingress/service) is available from outside the cluster.
* **Original Resource Metadata**: Information about the resource (name, image, runtime, exposed ports, etc.).

Every resource has two layers of network access:

1. **Container Port (private access)** – Determined by the container image. Only when the image listens on a port can the container port be accessed.
2. **Public Ingress Service (public access)** – Configured by the user to expose one of the container ports. Most issues occur when the wrong port is selected.

</Identity>  

<Instruction>  

You are in **NetworkAnalysisMode**. Respond only to requests relevant to this mode, using the given report. <NetworkAnalysisModeInstruction>

# Network Analysis Mode

Your role is to analyze the given network status data and provide a clear assessment of connectivity issues.

Rules for Analysis

1. **Normal Condition**

   * Both container and public access are reachable/ready.
   * Action: Report that network connectivity is normal with a concise statement.

2. **Case 1 – Container port unreachable, public access unavailable**

   * Meaning: No working service is listening on the exposed port.
   * Action: Advise the user to check what port their service is actually listening on and adjust the public service configuration accordingly.

3. **Case 2 – Container port reachable, but public access unavailable**

   * Meaning: The service is running internally, but public ingress is misconfigured.
   * Action: Suggest checking ingress configuration, firewall rules, or load balancer settings.

4. **Error Condition**

   * If container access is failing, highlight internal connectivity issues that need immediate attention.

Guidelines

* Provide concise responses when network connectivity is normal.
* Explicitly mention which layer(s) failed if there is an issue.
* Identify patterns or recurring network problems if present.
* Always explain how you interpreted the report (e.g., “container port 8080 not reachable, public URL returns 503”).
* Do not restate the raw JSON report back to the user, only summarize findings and recommendations.
* If multiple problems exist, report them all.

</Instruction>  
`;

export default function NetworkNode({ data }: NetworkNodeProps) {
  const { target } = data;
  const nodeId = `network-${target.name || target.resourceType}`;
  const { resource, isLoading, error } = useResourceStatus(target);
  const { readyStatus, getBackgroundColor } = useNetworkStatus(target);
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const { mutate: sendMessage } = useSendMessageMutation();
  const { selectResource } = useProjectActions();
  const { copyToClipboard, isCopied } = useCopy();

  // Get container ports data for network diagnosis
  const containerStatusResult = useResourceStatus<ContainerPortsResult>(target, (resource) =>
    extractContainerPorts(resource?.ports)
  );
  const containerPortsData = containerStatusResult.resource;
  const originalResource = (containerStatusResult as any).originalResource;

  // Use container status hook for network diagnosis
  const {
    data: containerStatus,
    isLoading: isContainerLoading,
    error: containerError,
  } = useContainerStatus(
    containerPortsData?.ports || [],
    containerPortsData?.host || "",
    2000 // 2 second timeout
  );

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
  const backgroundCardData = networkData.slice(1);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (notReadyCount > 0) {
      selectResource(target);
      appendSystemMessage({ type: "universal.diagnoseNetwork", target });

      // Prepare network status data for analysis
      const networkStatusData = {
        containerStatus,
        networkStatus: readyStatus,
        containerPortsData,
        originalResource,
        isContainerLoading,
        containerError,
        ports: originalResource?.ports,
      };

      // Send network status data for analysis after system message is appended
      sendMessage({
        role: "system",
        content:
          analyzeNetworkPrompt + "\n\n" + JSON.stringify(networkStatusData),
      });
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
      <BaseNode target={target} nodeId={nodeId} className="h-14 p-2 bg-muted">
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
        className="h-14 p-2 bg-status-error/20"
      >
        <div className="flex items-center justify-center h-full text-sm text-theme-red">
          Error loading resource
        </div>
      </BaseNode>
    );
  }

  // Determine message type based on target resource type
  const messageType = target.resourceType === "devbox" 
    ? "devbox.network" 
    : "universal.network";

  const mainCard = (
    <BaseNode
      target={target}
      nodeId={nodeId}
      messageType={messageType}
      className={cn("h-14 p-2", getBackgroundColor())}
    >
      <div className="flex items-center justify-center h-full">
        {frontCardUrl ? (
          <div className="flex items-center justify-center gap-2 text-sm w-full">
            {notReadyCount > 0 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="h-4 w-4 flex-shrink-0 cursor-help text-yellow-500"
                      onClick={handleIconClick}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    className="bg-background-tertiary border border-border-primary"
                    side="bottom"
                    align="start"
                  >
                    <p>Click to diagnose network issues with AI</p>
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
                  <TooltipContent
                    className="bg-background-tertiary border border-border-primary"
                    side="bottom"
                    align="start"
                  >
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
      messageType={messageType}
      nodeId={nodeId}
    />
  );
}
