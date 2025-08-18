"use client";

import React from "react";
import { DatabaseBackup } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

interface NodeBackupProps {
  resource: {
    name: string;
    backups?: any[];
  };
}

export default function NodeBackup({ resource }: NodeBackupProps) {
  const { sendSystemMessage } = useSendSystemMessageMutation();

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
                type: "info.clusterBackup",
                payload: {
                  backups: resource.backups || [],
                  clusterName: resource.name,
                },
              });
            }}
          >
            <DatabaseBackup className="h-4 w-4 text-theme-green" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg p-2"
        >
          <p className="font-medium">View backups</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
