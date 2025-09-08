"use client";

import React from "react";
import { Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";

import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface NodeMonitorProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

const analyzeMonitorPrompt = `
  <Identity>

You are Sealos Brain, an agent on the Sealos platform, assisting users in managing cloud computing resources within the Sealos ecosystem. One of your responsibilities is analyzing **resource monitor data** to help users understand the current status of their resources and decide whether action is needed (monitoring, warning, or upgrading). 

Resource Monitor Data
Each datapoint contains a timestamp and resource usage at that point in time.
Resources include CPU, Memory, and Storage, expressed as percentage values (e.g., 2.58 means 2.58% of quota limits).
Data is ordered from earliest to latest, covering at most the past one hour (could be shorter).

</Identity>

 <Instruction>

You are in **ResourceAnalysisMode**. Respond only to requests relevant to this mode, using available tools and information. <ResourceAnalysisModeInstruction> 

# Resource Analysis Mode 

Your role is to analyze the given monitor data and provide a clear assessment of the resource condition.

Rules for Analysis

Normal Condition: If all resource usage values remain below 70%, report that the condition is normal with a short and concise statement.

Warning Condition: If any resource usage exceeds 70% but is ≤ 90%, raise a warning and suggest the user keep an eye on that resource.

Upgrade Condition: If any resource usage exceeds 90%, suggest upgrading the resource limit. After analysis, you may call the upgrade tool.

 

Guidelines

Provide short and concise responses when usage is low (all < 70%).

Explicitly mention which resources are in high usage if any exceed 70%.

If multiple abnormal conditions exist, report them all (e.g., memory warning + storage upgrade).

Always explain how you interpreted the data (which resources at what usage levels) and what your conclusion is before calling the tool.

If an upgrade is needed, finish the analysis first, then call the tool.

Do not restate the raw monitor data back to the user, only summarize your interpretation.
`;

export default function NodeMonitor({ target }: NodeMonitorProps) {
  const { mutate: sendMessage } = useSendMessageMutation();
  const { color, monitorData, isLoading } = useResourceMetricsStatus({
    target,
  });
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "universal.monitor",
    onSuccess: () => {
      // Send monitor data for analysis after system message is appended
      sendMessage({
        role: "system",
        content: analyzeMonitorPrompt + "\n\n" + JSON.stringify(monitorData),
      });
    },
  });

  // Check if monitor data is ready (not loading and has data)
  const isMonitorReady =
    !isLoading &&
    monitorData &&
    Array.isArray(monitorData) &&
    monitorData.length > 0;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`p-1 border-2 border-muted-foreground/20 rounded-full transition-colors ${
              isMonitorReady
                ? "cursor-pointer hover:border-muted-foreground/40"
                : "cursor-not-allowed opacity-50"
            }`}
            onClick={(e) => {
              if (!isMonitorReady) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              e.preventDefault();
              e.stopPropagation();
              handleNodeSelect();
            }}
          >
            <Activity
              className={`h-4 w-4 ${
                isMonitorReady ? color : "text-theme-gray"
              }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">
            {isMonitorReady ? "Check Usage" : "No monitor data available"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
