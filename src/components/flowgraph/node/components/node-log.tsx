"use client";

import React from "react";
import { NotebookText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAnalyzeLogs } from "@/hooks/copilot/use-analyze-logs";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface NodeLogProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export default function NodeLog({ target }: NodeLogProps) {
  const { analyzeLogs, isLogsReady } = useAnalyzeLogs(target);

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
              analyzeLogs();
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
        <TooltipContent side="bottom">
          <p className="font-medium">
            {isLogsReady ? "Analyze Logs" : "No logs available"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
