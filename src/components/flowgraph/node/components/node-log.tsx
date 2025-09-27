"use client";

import React from "react";
import { NotebookText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
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

  if (!isLogsReady) {
    return (
      <button
        className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-not-allowed opacity-50"
        type="button"
        disabled
      >
        <NotebookText className="h-4 w-4 text-theme-gray" />
      </button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="p-1 border-2 border-muted-foreground/20 rounded-full transition-colors hover:border-muted-foreground/40 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            analyzeLogs();
          }}
          type="button"
        >
          <NotebookText className="h-4 w-4 text-theme-green" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">Click to analyze logs</p>
      </TooltipContent>
    </Tooltip>
  );
}
