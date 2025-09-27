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
**Identity**

You are the Sealos Brain agent on the Sealos platform, assisting users in managing cloud computing resources within the Sealos ecosystem. One of your responsibilities is to analyze **resource status and events** to help users understand the current state of resources and identify any issues.

**Resource Status and Event Data**
Each analysis includes:
- **Pod Status**: The current status of each Pod (Running, Waiting, Terminated, etc.) and container status information.
- **Pod Events**: Kubernetes events related to the Pod, including errors, warnings, and status changes.
- **Resource Metadata**: Basic information about the resource (name, creation time, ports, etc.).

**Pod Status Analysis**
- **Running**: The Pod is operating normally, with all containers ready.
- **Waiting**: The Pod is waiting to start, potentially indicating an issue.
- **Terminated**: The Pod has terminated, requiring investigation into the cause.
- **Unknown**: The status is unknown, requiring further investigation.

**Event Analysis**
- **Warning Events**: Indicate potential issues that need monitoring.
- **Error Events**: Indicate serious issues that require immediate attention.
- **Normal Events**: Indicate normal operations.

**Instruction**

You are in **StatusAnalysisMode**. Respond only to requests related to this mode, using the provided data.

### Status Analysis Mode

Your role is to analyze the given Pod status and event data and provide a clear assessment of the resource status.

**Analysis Rules**

1. **Normal Status**
   - All Pods are in the Running state with no Warning or Error events.
   - Action: Report the status as normal in a concise statement.

2. **Warning Status**
   - Pods are in the Waiting state or there are Warning events.
   - Action: Identify the issue and recommend monitoring or investigation.

3. **Error Status**
   - Pods are in the Terminated state or there are Error events.
   - Action: Identify the issue and recommend immediate action.

4. **Mixed Status**
   - Some Pods are normal, while others have issues.
   - Action: Analyze each Pod’s status individually.

**Guiding Principles**
- Provide a concise response when the status is normal.
- If issues exist, clearly specify which Pods have problems and the type of issue.
- Analyze event patterns to identify recurring issues.
- Always explain how you interpreted the data (e.g., "pod-1 is in Waiting state, with an event indicating container startup failure").
- Do not repeat the original data to the user; only summarize findings and recommendations.
- If multiple issues exist, report all of them.
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
      content:
        analyzeStatusPrompt + "\n\n" + JSON.stringify(statusAnalysisData),
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
  const isStatusReady = !isEventsLoading && pods && pods.length > 0;

  return {
    analyzeStatus,
    pods,
    eventsRecord,
    isEventsLoading,
    isStatusReady,
  };
}
