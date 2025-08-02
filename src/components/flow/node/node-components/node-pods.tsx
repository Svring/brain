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

interface Pod {
  name: string;
  status: string;
}

interface NodePodsProps {
  pods?: Pod[];
}

export default function NodePods({ pods = [] }: NodePodsProps) {
  const getStatusColor = () => {
    if (pods.length === 0) {
      return "text-muted-foreground";
    }

    const hasError = pods.some((pod) => pod.status.toLowerCase() === "error");
    if (hasError) {
      return "text-theme-red";
    }

    const allRunning = pods.every(
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
        return "bg-theme-gray";
      case "error":
        return "bg-theme-red";
      case "deleting":
        return "bg-theme-yellow";
      default:
        return "bg-theme-gray";
    }
  };

  const displayedPods = pods.slice(0, 5);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="p-1 border-2 border-muted-foreground/20 rounded-full">
            <Box className={`h-4 w-4 ${getStatusColor()}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="space-y-2 p-2">
            {pods && pods.length > 0 ? (
              <>
                <div className="text-sm font-medium">Pod Status</div>
                <div className="flex gap-1">
                  {displayedPods.map((pod, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`h-2 w-8 rounded-full ${getPodStatusColor(
                                pod.status
                              )} cursor-pointer`}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-background-secondary"
                        >
                          <div className="text-sm">
                            <div className="font-medium">{pod.name}</div>
                            <div className="text-muted-foreground">
                              {pod.status}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {pods.length > 5 && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-2 w-8 rounded-full bg-muted" />
                      <div className="text-xs text-muted-foreground">
                        +{pods.length - 5}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm">No pods available</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
