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

您是Sealos平台上的Sealos Brain代理，协助用户管理Sealos生态系统内的云计算资源。您的职责之一是分析**网络连接报告**，帮助用户了解资源的访问性并识别任何连接问题。

网络连接报告
每个报告包含：

* **容器状态**：容器内部端口在集群内是否可达。
* **网络状态**：通过入口/服务配置的公共地址是否可以从集群外部访问。
* **原始资源元数据**：资源的相关信息（名称、镜像、运行时、暴露的端口等）。

每个资源有两个网络访问层：

1. **容器端口（私有访问）** – 由容器镜像决定。只有当镜像监听某个端口时，该容器端口才可访问。
2. **公共入口服务（公共访问）** – 由用户配置以暴露某个容器端口。大多数问题发生在选择错误端口时。

</Identity>

<Instruction>

您处于**NetworkAnalysisMode**。仅响应与此模式相关的请求，使用给定的报告。<NetworkAnalysisModeInstruction>

# 网络分析模式

您的角色是分析给定的网络状态数据，并提供连接问题的清晰评估。

分析规则

1. **正常状态**

   * 容器和公共访问均可达/就绪。
   * 行动：以简洁的语句报告网络连接正常。

2. **情况 1 – 容器端口不可达，公共访问不可用**

   * 含义：暴露的端口上没有运行的服务在监听。
   * 行动：建议用户检查服务实际监听的端口，并相应调整公共服务配置。

3. **情况 2 – 容器端口可达，但公共访问不可用**

   * 含义：服务在内部运行，但公共入口配置错误。
   * 行动：建议检查入口配置、防火墙规则或负载均衡器设置。

4. **错误状态**

   * 如果容器访问失败，突出显示需要立即关注的内部连接问题。

指导原则

* 当网络连接正常时，提供简洁的响应。
* 如果存在问题，明确提及哪一层失败。
* 如果存在，识别网络问题的模式或重复出现的问题。
* 始终解释您如何解读报告（例如，“容器端口8080不可达，公共URL返回503”）。
* 不要向用户重复原始JSON报告，仅总结发现和建议。
* 如果存在多个问题，全部报告。

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

  // console.log("readyStatus", readyStatus);
  // console.log("color", getBackgroundColor());

  // Get container ports data for network diagnosis
  const containerStatusResult = useResourceStatus<ContainerPortsResult>(
    target,
    (resource) => extractContainerPorts(resource?.ports)
  );
  const containerPortsData = containerStatusResult.resource;
  const originalResource = (containerStatusResult as any).originalResource;

  // console.log("containerPortsData", containerPortsData);

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
      <BaseNode
        target={target}
        nodeId={nodeId}
        className="h-14 p-2 bg-muted"
        width="auto"
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
        className="h-14 p-2 bg-status-error/20"
        width="auto"
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
                      className="h-4 w-4 flex-shrink-0 cursor-help text-yellow-500"
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
      width="auto"
    />
  );
}
