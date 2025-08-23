"use client";

import React, { useCallback } from "react";
import { NotebookText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface NodeLogProps {
  target?: CustomResourceTarget | BuiltinResourceTarget;
}

export default function NodeLog({ target }: NodeLogProps) {
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const handleLogClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!target) return;

      appendSystemMessage("info.resourceLog", target);
    },
    [target, appendSystemMessage]
  );

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="p-1 border-2 border-muted-foreground/20 rounded-full hover:border-muted-foreground/40 transition-colors"
            onClick={handleLogClick}
            type="button"
          >
            <NotebookText className="h-4 w-4 text-theme-green" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg p-2"
        >
          <p className="font-medium">View logs</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
