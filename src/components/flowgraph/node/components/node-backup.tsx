"use client";

import React from "react";
import { DatabaseBackup } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useSelectedResource } from "@/hooks/brain/use-selected-resource";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useProjectActions } from "@/contexts/project/project-context";

interface NodeBackupProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export default function NodeBackup({ target }: NodeBackupProps) {
  const { selectResource } = useProjectActions();
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const { shouldCreateChatSession } = useSelectedResource(target);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-pointer hover:border-muted-foreground/40 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              selectResource(target);
              appendSystemMessage(
                "info.clusterBackup",
                target,
                shouldCreateChatSession
              );
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
