"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useStreamContext } from "@/components/provider/stream-provider";
import { useThreads } from "@/components/provider/thread-provider";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

const analyzeMonitorPrompt = `
**Identity**

You are the Sealos Brain agent on the Sealos platform, assisting users in managing cloud computing resources within the Sealos ecosystem. One of your responsibilities is to analyze **resource monitoring data** to help users understand the current state of resources and determine whether actions (monitoring, warnings, or upgrades) are necessary.

**Resource Monitoring Data**
- Each data point includes a timestamp and the resource usage at that time.
- Resources include CPU, memory, and storage, expressed as percentage values relative to the resource quota limit.
- **IMPORTANT**: All numbers in the monitoring data are percentages, not absolute values.

**Examples of Resource Usage Interpretation:**
- **CPU**: "cpu": 25.5 means 25.5% of the CPU quota limit is being used
- **Memory**: "memory": 67.8 means 67.8% of the memory quota limit is being used  
- **Storage**: "storage": 40.99 means 40.99% of the storage quota limit is being used

**Sample Data Point:**
{
  "timestamp": 1757898720,
  "readableTime": "2025/09/15 09:12",
  "cpu": 0,
  "memory": 0,
  "storage": 40.99
}
This indicates that at this specific time, CPU and memory usage are 0%, while storage usage is 40.99% of the quota limit.

- Data is sorted chronologically from earliest to latest, covering up to the past hour (possibly less).

**Instruction**

You are in **ResourceAnalysisMode**. Respond only to requests related to this mode, using available tools and information.

### Resource Analysis Mode

Your role is to analyze the provided monitoring data and provide a clear assessment of the resource status.

**Analysis Rules**
- **Normal Status**: If all resource usage is below 70%, report the status as normal in a concise and clear statement.
- **Warning Status**: If any resource usage exceeds 70% but is ≤90%, issue a warning and recommend close monitoring of that resource.
- **Upgrade Status**: If any resource usage exceeds 90%, recommend upgrading the resource limit. After analysis, you may invoke the upgrade tool.

**Guiding Principles**
- Provide a concise and clear response when usage is low (all <80%).
- Explicitly mention which resources have high usage (if any exceed 80%).
- If multiple anomalies exist, report all of them (e.g., memory warning + storage upgrade).
- Always explain how you interpreted the data (which resources reached what usage level) and your conclusion before invoking any tools.
- If an upgrade is needed, complete the analysis before invoking the tool.
- Do not repeat the original monitoring data to the user; only summarize your interpretation.
`;

export function useAnalyzeMonitor(
	target: CustomResourceTarget | BuiltinResourceTarget,
) {
	const { color, monitorData, isLoading } = useResourceMetricsStatus({
		target,
	});
	const { addPendingMessage, triggerPendingMessages } = useChatActions();

	// Use node select to handle the selection and message appending
	const { handleNodeSelect } = useNodeSelect({
		target,
	});

	const diagnoseMonitor = useCallback(async () => {
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
		await handleNodeSelect();

		// Add event message before analysis
		const eventMessage = {
			id: `monitor-event-${Date.now()}`,
			type: "system" as const,
			content: JSON.stringify({
				type: "universal.event",
				target: target,
				payload: {
					message: "Starting monitor analysis...",
					createdAt: new Date().toISOString(),
				},
			}),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		// Add pending messages for this resource target
		const systemMessage1 = {
			id: `monitor-system-1-${Date.now()}`,
			type: "system" as const,
			content: JSON.stringify({
				type: "universal.monitor",
				target,
				payload: monitorData,
			}),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const systemMessage2 = {
			id: `monitor-system-2-${Date.now()}`,
			type: "system" as const,
			content: analyzeMonitorPrompt,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const systemMessage3 = {
			id: `monitor-system-3-${Date.now()}`,
			type: "system" as const,
			content: `Below is all the data needed to be analyzed, you need to identify any problem and report back to the user and advice fix.\n\n${JSON.stringify(
				monitorData,
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
		monitorData,
		handleNodeSelect,
		addPendingMessage,
		triggerPendingMessages,
		target,
	]);

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
