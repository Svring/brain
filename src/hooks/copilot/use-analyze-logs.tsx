"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useResourceLogs } from "@/hooks/sealos/resource/use-resource-logs";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { useStreamContext } from "@/components/provider/stream-provider";
import { useThreads } from "@/components/provider/thread-provider";
import { useChatActions } from "@/contexts/chat/chat-context";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

const analyzeLogsPrompt = `
<identity>
<p>您是Sealos平台上的Sealos Brain代理，协助用户管理Sealos生态系统内的云计算资源。您的职责之一是分析<strong>资源日志</strong>，帮助用户了解资源状况并识别任何问题或模式。</p>
<p>资源日志数据
每个日志条目包含时间戳和日志内容信息。
日志按时间顺序排列，可能包含各种日志级别（INFO、WARNING、ERROR等）。
数据涵盖近期活动，可能指示资源状态、错误或操作事件。</p>
</identity>
<instruction>
<p>您处于<strong>LogAnalysisMode</strong>。仅响应与此模式相关的请求，使用可用的工具和信息。</p>
<h1>日志分析模式</h1>
<p>您的角色是分析给定的日志数据，并提供清晰的评估结果。</p>
<p>分析规则</p>
<p>正常状态：如果日志显示正常操作，没有错误或警告，报告一切正常。</p>
<p>警告状态：如果日志包含警告或非关键错误，识别它们并建议监控。</p>
<p>错误状态：如果日志包含关键错误或故障，识别问题并建议立即采取行动。</p>
<p>指导原则</p>
<p>当日志正常时，提供简洁的响应。
明确提及发现的任何警告或错误。
如果存在，识别模式或重复出现的问题。
在提供建议之前总结您的解释。
不要向用户重复原始日志数据，仅总结您的发现。</p></instruction>
`;

export function useAnalyzeLogs(
  target: CustomResourceTarget | BuiltinResourceTarget
) {
  const logsQuery = useResourceLogs(target);
  const { data: logsData, isLoading } = logsQuery;
  const { addPendingMessage, triggerPendingMessages } = useChatActions();

  // Use node select to handle the selection and message appending
  const { handleNodeSelect } = useNodeSelect({
    target,
  });

  const analyzeLogs = useCallback(async () => {
    // Check if logs data is null or empty
    if (!logsData || Object.keys(logsData).length === 0) {
      toast.error("No logs data available for analysis");
      return;
    }

    // Use node select to handle the selection and message appending
    await handleNodeSelect();

    // Add event message before analysis
    const eventMessage = {
      id: `logs-event-${Date.now()}`,
      type: "system" as const,
      content: JSON.stringify({
        type: "universal.event",
        target: target,
        payload: {
          message: "Starting logs analysis...",
          createdAt: new Date().toISOString(),
        },
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add pending messages for this resource target
    const systemMessage1 = {
      id: `logs-system-1-${Date.now()}`,
      type: "system" as const,
      content: JSON.stringify({
        type: "universal.log",
        target,
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const systemMessage2 = {
      id: `logs-system-2-${Date.now()}`,
      type: "system" as const,
      content: analyzeLogsPrompt + "\n" + JSON.stringify(logsData),
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
    logsData,
    handleNodeSelect,
    addPendingMessage,
    triggerPendingMessages,
    target,
  ]);

  // Check if logs are ready (not loading and has data)
  const isLogsReady =
    !isLoading && logsData && Object.keys(logsData).length > 0;

  return {
    analyzeLogs,
    logsData,
    isLoading,
    isLogsReady,
  };
}
