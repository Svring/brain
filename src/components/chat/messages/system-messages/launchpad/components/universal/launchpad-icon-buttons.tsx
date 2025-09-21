"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pause, Power } from "lucide-react";
import { useLaunchpadLifecycle } from "@/hooks/sealos/launchpad/use-launchpad-lifecycle";

interface LaunchpadObject {
  name: string;
  status: string;
  resource?: any;
}

interface LaunchpadIconButtonsProps {
  object: LaunchpadObject;
}

export default function LaunchpadIconButtons({
  object,
}: LaunchpadIconButtonsProps) {
  const { name, status } = object;
  const { executeAction, isPending } = useLaunchpadLifecycle();

  const isRunning = status === "Running";
  const isResourcePending = status === "Pending";

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {/* Start Button - Only show when not running and not pending */}
          {!isRunning && !isResourcePending && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => executeAction("start", name)}
                  disabled={isResourcePending || isPending("start")}
                  className={`h-8 w-8 p-0 ${
                    isResourcePending ? "opacity-50" : ""
                  }`}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              {/* <TooltipContent side="bottom">
                <p>Start</p>
              </TooltipContent> */}
            </Tooltip>
          )}

          {/* Pause Button - Only show when running */}
          {isRunning && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => executeAction("pause", name)}
                  disabled={isResourcePending || isPending("pause")}
                  className={`h-8 w-8 p-0 ${
                    isResourcePending ? "opacity-50" : ""
                  }`}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              {/* <TooltipContent side="bottom">
                <p>Pause</p>
              </TooltipContent> */}
            </Tooltip>
          )}

        </div>
      </TooltipProvider>

    </>
  );
}
