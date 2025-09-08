"use client";

import React from "react";
import { DatabaseBackup } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface NodeBackupProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export default function NodeBackup({ target }: NodeBackupProps) {
  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "info.clusterBackup",
  });

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-pointer hover:border-muted-foreground/40 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNodeSelect();
            }}
          >
            <DatabaseBackup className="h-4 w-4 text-theme-green" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">View backups</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
