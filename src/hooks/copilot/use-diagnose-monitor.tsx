"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  useAppendSystemMessageMutation,
  useSendMessageMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useProjectActions } from "@/contexts/project/project-context";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

const analyzeMonitorPrompt = `
  <Identity>

您是Sealos平台上的Sealos Brain代理，协助用户管理Sealos生态系统内的云计算资源。您的职责之一是分析**资源监控数据**，帮助用户了解资源的当前状态并决定是否需要采取行动（监控、警告或升级）。

资源监控数据
每个数据点包含时间戳和该时间点的资源使用情况。
资源包括CPU、内存和存储，以百分比值表示（例如，2.58表示占配额限制的2.58%）。
数据按时间从早到晚排序，最多涵盖过去一小时（可能更短）。

</Identity>

<Instruction>

您处于**ResourceAnalysisMode**。仅响应与此模式相关的请求，使用可用的工具和信息。<ResourceAnalysisModeInstruction>

# 资源分析模式

您的角色是分析给定的监控数据，并提供资源状况的清晰评估。

分析规则

正常状态：如果所有资源使用率低于70%，以简短且清晰的语句报告状况正常。

警告状态：如果任一资源使用率超过70%但≤90%，发出警告并建议用户密切关注该资源。

升级状态：如果任一资源使用率超过90%，建议升级资源限制。分析完成后，您可以调用升级工具。

指导原则

当使用率较低（全部<70%）时，提供简短且清晰的响应。
明确提及哪些资源使用率高（如果有超过70%的）。
如果存在多个异常情况，全部报告（例如，内存警告+存储升级）。
始终解释您如何解读数据（哪些资源达到什么使用率水平）以及您的结论，然后再调用工具。
如果需要升级，先完成分析，然后调用工具。
不要向用户重复原始监控数据，仅总结您的解读。
`;

export function useDiagnoseMonitor(
  target: CustomResourceTarget | BuiltinResourceTarget
) {
  const appendSystemMessageMutation = useAppendSystemMessageMutation();
  const { mutate: sendMessage } = useSendMessageMutation();
  const { selectResource } = useProjectActions();
  const { color, monitorData, isLoading } = useResourceMetricsStatus({
    target,
  });

  // Use node select to handle the selection and message appending
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "universal.monitor",
    payload: {
      monitorData,
      prompt: analyzeMonitorPrompt,
    },
  });

  const diagnoseMonitor = useCallback(() => {
    // Check if monitor data is null or empty
    if (
      !monitorData ||
      !Array.isArray(monitorData) ||
      monitorData.length === 0
    ) {
      toast.error("No monitor data available for analysis");
      return;
    }

    // Use node select to handle the selection and message appending
    handleNodeSelect("append");

    // Comment out sendMessage for now
    // sendMessage({
    //   role: "system",
    //   content: analyzeMonitorPrompt + "\n\n" + JSON.stringify(monitorData),
    // });
  }, [monitorData, handleNodeSelect]);

  // Check if monitor data is ready (not loading and has data)
  const isMonitorReady =
    !isLoading &&
    monitorData &&
    Array.isArray(monitorData) &&
    monitorData.length > 0;

  return {
    diagnoseMonitor,
    color,
    monitorData,
    isLoading,
    isMonitorReady,
  };
}
