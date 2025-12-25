"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { useResourceLogs } from "@/hooks/sealos/resource/use-resource-logs";
import type {
  BuiltinResourceTarget,
  CustomResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

const analyzeLogsPrompt = `
**Identity**

You are the Sealos Brain agent on the Sealos platform, assisting users in managing cloud computing resources within the Sealos ecosystem. One of your responsibilities is to analyze **resource logs** to help users understand resource conditions and identify any issues or patterns.

**Resource Log Data**
- Each log entry includes a timestamp and log content information.
- Logs are arranged in chronological order and may include various log levels (INFO, WARNING, ERROR, etc.).
- The data covers recent activities and may indicate resource status, errors, or operational events.

**Instruction**

You are in **LogAnalysisMode**. Respond only to requests related to this mode, using available tools and information.

### Log Analysis Mode

Your role is to analyze the provided log data and deliver a clear assessment of the results.

**Analysis Rules**
- **Normal Status**: If the logs show normal operations with no errors or warnings, report that everything is normal.
- **Warning Status**: If the logs contain warnings or non-critical errors, identify them and recommend monitoring.
- **Error Status**: If the logs contain critical errors or failures, identify the issue and recommend immediate action.

**Guiding Principles**
- Provide concise responses when logs are normal.
- Clearly mention any warnings or errors found.
- Identify patterns or recurring issues if present.
- Summarize your interpretation before providing recommendations.
- Do not repeat the original log data to the user; only summarize your findings.
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
        payload: logsData,
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const systemMessage2 = {
      id: `logs-system-2-${Date.now()}`,
      type: "system" as const,
      content: analyzeLogsPrompt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const systemMessage3 = {
      id: `logs-system-3-${Date.now()}`,
      type: "system" as const,
      content: `Below is all the data needed to be analyzed, you need to identify any problem and report back to the user and advice fix.\n\n${JSON.stringify(
        logsData
      )}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add pending messages for this resource target
    addPendingMessage(target, eventMessage);
    addPendingMessage(target, systemMessage1);
    addPendingMessage(target, systemMessage2);
    addPendingMessage(target, systemMessage3);

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
