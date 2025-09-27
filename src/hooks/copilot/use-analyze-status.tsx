"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { usePodEvents } from "@/hooks/sealos/pod/use-pod-events";
import { usePods } from "@/hooks/sealos/pod/use-pods";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { useChatActions } from "@/contexts/chat/chat-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

const analyzeStatusPrompt = `
<Identity>

您是Sealos平台上的Sealos Brain代理，协助用户管理Sealos生态系统内的云计算资源。您的职责之一是分析**资源状态和事件**，帮助用户了解资源的当前状态并识别任何问题。

资源状态和事件数据
每个分析包含：
* **Pod状态**：每个Pod的当前状态（Running、Waiting、Terminated等）和容器状态信息
* **Pod事件**：与Pod相关的Kubernetes事件，包括错误、警告和状态变化
* **资源元数据**：资源的基本信息（名称、创建时间、端口等）

Pod状态分析
- Running：Pod正常运行，所有容器就绪
- Waiting：Pod等待启动，可能存在问题
- Terminated：Pod已终止，需要检查原因
- Unknown：状态未知，需要进一步调查

事件分析
- Warning事件：表示潜在问题，需要关注
- Error事件：表示严重问题，需要立即处理
- Normal事件：表示正常操作

</Identity>

<Instruction>

您处于**StatusAnalysisMode**。仅响应与此模式相关的请求，使用给定的数据。<StatusAnalysisModeInstruction>

# 状态分析模式

您的角色是分析给定的Pod状态和事件数据，并提供资源状况的清晰评估。

分析规则

1. **正常状态**
   * 所有Pod状态为Running且无Warning/Error事件
   * 行动：以简洁的语句报告状态正常

2. **警告状态**
   * 存在Waiting状态的Pod或Warning事件
   * 行动：识别问题并建议监控或检查

3. **错误状态**
   * 存在Terminated状态的Pod或Error事件
   * 行动：识别问题并建议立即采取行动

4. **混合状态**
   * 部分Pod正常，部分有问题
   * 行动：分别分析每个Pod的状态

指导原则

* 当状态正常时，提供简洁的响应
* 如果存在问题，明确提及哪些Pod有问题以及问题类型
* 分析事件模式，识别重复出现的问题
* 始终解释您如何解读数据（例如，"pod-1处于Waiting状态，事件显示容器启动失败"）
* 不要向用户重复原始数据，仅总结发现和建议
* 如果存在多个问题，全部报告

</Instruction>
`;

export function useAnalyzeStatus(
  target: CustomResourceTarget | BuiltinResourceTarget
) {
  const { pods } = usePods({ target });
  const podTargets = pods
    .map((pod) => convertResourceTypeToTarget("pod", pod.name))
    .filter(
      (
        t
      ): t is {
        type: "builtin";
        resourceType: string;
        name?: string | undefined;
        labelSelector?: string | undefined;
      } => t.type === "builtin"
    );

  const { eventsRecord, isLoading: isEventsLoading } = usePodEvents({
    podTargets,
    enabled: podTargets.length > 0,
  });

  const { addPendingMessage, triggerPendingMessages } = useChatActions();

  // Use node select to handle the selection and message appending
  const { handleNodeSelect } = useNodeSelect({
    target,
  });

  const analyzeStatus = useCallback(async () => {
    // Check if we have pods and events data
    if (!pods || pods.length === 0) {
      toast.error("No pods available for status analysis");
      return;
    }

    if (isEventsLoading) {
      toast.error("Events data is still loading, please wait");
      return;
    }

    // Use node select to handle the selection and message appending
    await handleNodeSelect();

    // Prepare status analysis data
    const statusAnalysisData = {
      pods: pods.map((pod, i) => ({
        podName: `pod-${i + 1}`,
        actualName: pod.name,
        status: pod.containerStatuses?.[0]?.ready ? "Running" : "Not Ready",
        containerStatuses: pod.containerStatuses,
        createdAt: pod.createdAt,
        ports: pod.ports,
        resources: pod.resources,
      })),
      events: eventsRecord,
      resourceTarget: target,
    };

    // Add event message before analysis
    const eventMessage = {
      id: `status-event-${Date.now()}`,
      type: "system" as const,
      content: JSON.stringify({
        type: "universal.event",
        target: target,
        payload: {
          message: "Starting Pods status analysis...",
          createdAt: new Date().toISOString(),
        },
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add pending messages for this resource target
    const systemMessage1 = {
      id: `status-system-1-${Date.now()}`,
      type: "system" as const,
      content: JSON.stringify({
        type: "universal.analyzeStatus",
        target,
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const systemMessage2 = {
      id: `status-system-2-${Date.now()}`,
      type: "system" as const,
      content: analyzeStatusPrompt + "\n\n" + JSON.stringify(statusAnalysisData),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add pending messages for this resource target
    addPendingMessage(target, eventMessage);
    addPendingMessage(target, systemMessage1);
    addPendingMessage(target, systemMessage2);

    // Trigger pending message submission
    triggerPendingMessages(target);
  }, [
    pods,
    eventsRecord,
    isEventsLoading,
    handleNodeSelect,
    addPendingMessage,
    triggerPendingMessages,
    target,
  ]);

  // Check if status analysis is ready (not loading and has data)
  const isStatusReady =
    !isEventsLoading && pods && pods.length > 0;

  return {
    analyzeStatus,
    pods,
    eventsRecord,
    isEventsLoading,
    isStatusReady,
  };
}
