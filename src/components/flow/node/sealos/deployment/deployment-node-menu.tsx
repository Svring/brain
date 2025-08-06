"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pause,
  RotateCcw,
  Trash2,
  PencilLine,
  Power,
} from "lucide-react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import useDeploymentNode from "@/hooks/sealos/deployment/use-deployment-node";
import { createK8sContext, createSealosContext } from "@/lib/auth/auth-utils";
import {
  useDeleteAppMutation,
  useStartAppMutation,
  useStopAppMutation,
} from "@/lib/sealos/app/app-method/app-mutation";

export default function DeploymentNodeMenu({
  target,
}: {
  target: BuiltinResourceTarget;
}) {
  const k8sContext = createK8sContext();
  const sealosContext = createSealosContext();
  const { data: deployment } = useDeploymentNode(k8sContext, target);

  const deleteApp = useDeleteAppMutation(sealosContext);
  const startApp = useStartAppMutation(sealosContext);
  const stopApp = useStopAppMutation(sealosContext);

  const appName = target.name;
  const status = deployment?.status;
  const isRunning =
    status?.replicas && status.replicas > 0 && !status.unavailableReplicas;

  if (!deployment) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="rounded-xl bg-background-secondary"
        align="start"
      >
        {!isRunning && appName && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              startApp.mutate({ appName });
            }}
            disabled={startApp.isPending}
          >
            <Power className="mr-2 h-4 w-4" />
            Start
          </DropdownMenuItem>
        )}
        {isRunning && appName && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              stopApp.mutate({ appName });
            }}
            disabled={stopApp.isPending}
          >
            <Pause className="mr-2 h-4 w-4" />
            Stop
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled>
          <PencilLine className="mr-2 h-4 w-4" />
          Update
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restart
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {appName && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              deleteApp.mutate({ name: appName });
            }}
            className="text-destructive"
            disabled={deleteApp.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
