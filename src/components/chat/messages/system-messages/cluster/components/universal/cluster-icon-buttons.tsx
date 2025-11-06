"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pause, Power, RotateCcw } from "lucide-react";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { useClusterLifecycle } from "@/hooks/sealos/cluster/use-cluster-lifecycle";

interface ClusterIconButtonsProps {
  object: ClusterObject;
}

export default function ClusterIconButtons({
  object,
}: ClusterIconButtonsProps) {
  const { name: clusterName, status } = object;
  const { executeAction, isPending } = useClusterLifecycle();

  const isCreating = status === "Creating";
  const isUpdating = status === "Updating";
  const isResourcePending = isCreating || isUpdating;

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {/* Start Button - Only show when not running */}
          {status !== "Running" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => executeAction("start", clusterName)}
                  disabled={isResourcePending || isPending("start")}
                  className={`h-8 w-8 p-0 ${
                    isResourcePending ? "opacity-50" : ""
                  }`}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Start</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Pause Button - Only show when not stopped or shutdown */}
          {status !== "Stopped" && status !== "Shutdown" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => executeAction("pause", clusterName)}
                  disabled={isResourcePending || isPending("pause")}
                  className={`h-8 w-8 p-0 ${
                    isResourcePending ? "opacity-50" : ""
                  }`}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Pause</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Restart Button - Always show */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => executeAction("restart", clusterName)}
                disabled={isResourcePending || isPending("restart")}
                className={`h-8 w-8 p-0 ${
                  isResourcePending ? "opacity-50" : ""
                }`}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Restart</p>
            </TooltipContent>
          </Tooltip>

        </div>
      </TooltipProvider>

    </>
  );
}
