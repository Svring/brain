"use client";

import React from "react";
import { NotebookText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function NodeLog() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-pointer hover:border-muted-foreground/40 transition-colors">
            <NotebookText className="h-4 w-4 text-theme-green" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg p-0"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="p-4 w-80">
            <div className="mb-3">
              <h3 className="text-sm font-medium">Logs</h3>
              <p className="text-xs text-muted-foreground">Container logs</p>
            </div>
            {/* Content will be added later */}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
