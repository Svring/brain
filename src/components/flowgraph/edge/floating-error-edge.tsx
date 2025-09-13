import React, { useState } from "react";
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  MarkerType,
  useInternalNode,
  EdgeLabelRenderer,
} from "@xyflow/react";

import { getEdgeParams } from "@/lib/flowgraph/edges/flowgraph-edges-utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
  useAppendSystemMessageMutation,
  useSendMessageMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useProjectActions } from "@/contexts/project/project-context";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

function FloatingErrorEdge(props: EdgeProps) {
  const { id, source, target, markerEnd } = props;
  const [isHovered, setIsHovered] = useState(false);

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  const resourceTarget = targetNode?.data.target as
    | CustomResourceTarget
    | BuiltinResourceTarget
    | undefined;

  // Get resource data similar to network node
  const { resource, isLoading, error } = useResourceStatus(resourceTarget!);

  // Message sending hooks
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const { mutate: sendMessage } = useSendMessageMutation();
  const { selectResource } = useProjectActions();

  if (!sourceNode || !targetNode || !resourceTarget) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  const errorColor = "#9F833B";

  const edgeStyle = {
    stroke: errorColor,
    strokeWidth: isHovered ? 2 : 1.5,
    strokeDasharray: "5,5", // Dashed line to indicate error state
    transition: "all 0.2s ease-in-out",
  };

  // Network analysis prompt (same as network node)
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

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (resourceTarget) {
      selectResource(resourceTarget);
      appendSystemMessage({
        type: "universal.diagnoseNetwork",
        target: resourceTarget,
      });

      // Prepare network status data for analysis (same as network node)
      const networkStatusData = {
        containerStatus: null, // Not available in edge context
        networkStatus: null, // Not available in edge context
        containerPortsData: null, // Not available in edge context
        originalResource: resource,
        isContainerLoading: isLoading,
        containerError: error,
        ports: resource?.ports,
        sourceNode: sourceNode.data,
        targetNode: targetNode.data,
      };

      // Send network status data for analysis after system message is appended
      sendMessage({
        role: "system",
        content:
          analyzeNetworkPrompt + "\n\n" + JSON.stringify(networkStatusData),
      });
    }
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: "help" }}
    >
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
      />
    </g>
  );
}

export default FloatingErrorEdge;
