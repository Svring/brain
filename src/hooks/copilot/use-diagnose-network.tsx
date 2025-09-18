"use client";

import { useCallback } from "react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useContainerStatus } from "@/hooks/sealos/network/use-container-status";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { useStreamContext } from "@/components/provider/stream-provider";
import { useThreads } from "@/components/provider/thread-provider";
import {
  extractContainerPorts,
  ContainerPortsResult,
} from "@/lib/sealos/services/ports/ports-utils";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

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
* 始终解释您如何解读报告（例如，"容器端口8080不可达，公共URL返回503"）。
* 不要向用户重复原始JSON报告，仅总结发现和建议。
* 如果存在多个问题，全部报告。

</Instruction>
`;

export function useDiagnoseNetwork(
  target: CustomResourceTarget | BuiltinResourceTarget
) {
  const { selectedThreadId } = useThreads();
  const { submitWithContext } = useStreamContext();

  // Get container ports data for network diagnosis
  const containerStatusResult = useResourceStatus<ContainerPortsResult>(
    target,
    (resource) => extractContainerPorts(resource?.ports)
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

  // Use node select to handle the selection and message appending
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "universal.diagnoseNetwork",
    payload: {
      containerStatus,
      containerPortsData,
      originalResource,
      isContainerLoading,
      containerError,
      prompt: analyzeNetworkPrompt,
    },
  });

  const diagnoseNetwork = useCallback(
    (readyStatus: any) => {
      // Use node select to handle the selection and message appending
      handleNodeSelect();

      // Send message using submitWithContext
      if (selectedThreadId) {
        const networkStatusData = {
          containerStatus,
          containerPortsData,
          originalResource,
          isContainerLoading,
          containerError,
        };

        submitWithContext({
          messages: [
            {
              type: "system",
              content: JSON.stringify({
                type: "universal.diagnoseNetwork",
                target,
              }),
            },
            {
              type: "system",
              content:
                analyzeNetworkPrompt +
                "\n\n" +
                JSON.stringify(networkStatusData),
            },
          ],
        });
      }
    },
    [
      handleNodeSelect,
      selectedThreadId,
      submitWithContext,
      containerStatus,
      containerPortsData,
      originalResource,
      isContainerLoading,
      containerError,
    ]
  );

  return {
    diagnoseNetwork,
    containerStatus,
    isContainerLoading,
    containerError,
    containerPortsData,
    originalResource,
  };
}
