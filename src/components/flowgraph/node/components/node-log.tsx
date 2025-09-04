"use client";

import React from "react";
import { NotebookText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useResourceLogs } from "@/hooks/sealos/resource/use-resource-logs";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface NodeLogProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

const analyzeLogsPrompt = `
<Identity>

You are Sealos Brain, an agent on the Sealos platform, assisting users in managing cloud computing resources within the Sealos ecosystem. One of your responsibilities is analyzing **resource logs** to help users understand what's happening with their resources and identify any issues or patterns.

Resource Logs Data
Each log entry contains timestamp and log content information.
Logs are ordered chronologically and may contain various log levels (INFO, WARNING, ERROR, etc.).
Data covers recent activity and may indicate resource status, errors, or operational events.

</Identity>

<Instruction>

You are in **LogAnalysisMode**. Respond only to requests relevant to this mode, using available tools and information.

# Log Analysis Mode 

Your role is to analyze the given log data and provide a clear assessment of what you found.

Rules for Analysis

Normal Condition: If logs show normal operations with no errors or warnings, report that everything appears normal.

Warning Condition: If logs contain warnings or non-critical errors, identify them and suggest monitoring.

Error Condition: If logs contain critical errors or failures, identify the issues and suggest immediate action.

Guidelines

Provide concise responses when logs are normal.
Explicitly mention any warnings or errors found.
Identify patterns or recurring issues if present.
Summarize your interpretation before providing recommendations.
Do not restate the raw log data back to the user, only summarize your findings.
`;

export default function NodeLog({ target }: NodeLogProps) {
  const { mutate: sendMessage } = useSendMessageMutation();
  const logsQuery = useResourceLogs(target);
  const { data: logsData, isLoading } = logsQuery;
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "universal.log",
    onSuccess: () => {
      // Send logs data for analysis after system message is appended
      sendMessage([
        {
          role: "system",
          content: analyzeLogsPrompt + "\n\n" + JSON.stringify(logsData),
        },
      ]);
    },
  });

  // Check if logs are ready (not loading and has data)
  const isLogsReady =
    !isLoading && logsData && Object.keys(logsData).length > 0;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`p-1 border-2 border-muted-foreground/20 rounded-full transition-colors ${
              isLogsReady
                ? "hover:border-muted-foreground/40 cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isLogsReady) {
                return;
              }
              handleNodeSelect();
            }}
            type="button"
            disabled={!isLogsReady}
          >
            <NotebookText
              className={`h-4 w-4 ${
                isLogsReady ? "text-theme-green" : "text-theme-gray"
              }`}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg p-2"
        >
          <p className="font-medium">
            {isLogsReady ? "Analyze Logs" : "No logs available"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
