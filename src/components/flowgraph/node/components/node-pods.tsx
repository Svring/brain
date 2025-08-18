"use client";

import React from "react";
import { Box } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

interface Pod {
  name: string;
  status: string;
}

interface NodePodsProps {
  resource: {
    pods?: Pod[];
  };
}

export default function NodePods({ resource }: NodePodsProps) {
  const { sendSystemMessage } = useSendSystemMessageMutation();
  
  // Extract pods from resource
  const podList = resource?.pods || [];
  const getStatusColor = () => {
    if (podList.length === 0) {
      return "text-muted-foreground";
    }

    const hasError = podList.some((pod) => pod.status.toLowerCase() === "error");
    if (hasError) {
      return "text-theme-red";
    }

    const allRunning = podList.every(
      (pod) => pod.status.toLowerCase() === "running"
    );
    if (allRunning) {
      return "text-theme-green";
    }

    return "text-theme-gray";
  };

  const getPodStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "running":
        return "bg-theme-green";
      case "stopped":
      case "shutdown":
        return "bg-theme-purple";
      case "pending":
      case "waiting":
        return "bg-theme-gray";
      case "error":
        return "bg-theme-red";
      case "deleting":
        return "bg-theme-yellow";
      default:
        return "bg-theme-gray";
    }
  };

  const displayedPods = podList.slice(0, 5);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-pointer hover:border-muted-foreground/40 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              sendSystemMessage({
                type: "info.podOverview",
                payload: resource,
              });
            }}
          >
            <Box className={`h-4 w-4 ${getStatusColor()}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="p-0">
            <div className="text-xs">View pods</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
