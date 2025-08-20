"use client";

import React from "react";
import { NotebookText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { CustomResourceTarget, BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface NodeLogProps {
  target?: CustomResourceTarget | BuiltinResourceTarget;
  resourceType?: "cluster" | "launchpad";
}

export default function NodeLog({ target, resourceType }: NodeLogProps) {
  const { sendSystemMessage } = useSendSystemMessageMutation();

  const handleLogClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!target) {
      console.warn("No target provided for NodeLog component");
      return;
    }

    // Determine the message type based on resource type
    let messageType: string;
    if (resourceType === "cluster") {
      messageType = "info.clusterLog";
    } else if (resourceType === "launchpad") {
      messageType = "info.launchpadLog";
    } else {
      // Try to infer from target type
      if ('group' in target && target.group) {
        messageType = "info.clusterLog";
      } else {
        messageType = "info.launchpadLog";
      }
    }

    // Send the system message
    sendSystemMessage({
      type: messageType as any,
      payload: target,
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-pointer hover:border-muted-foreground/40 transition-colors"
            onClick={handleLogClick}
          >
            <NotebookText className="h-4 w-4 text-theme-green" />
          </div>
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
