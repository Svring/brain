"use client";

import React from "react";
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
import { createSealosContext } from "@/lib/auth/auth-utils";
import {
  useDeleteLaunchpadMutation,
  useStartLaunchpadMutation,
  usePauseLaunchpadMutation,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-mutation";
import { StatefulsetObjectQuery } from "@/lib/sealos/resources/statefulset/statefulset-object-query-schema";
import { useRemoveFromProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

export default function StatefulsetNodeMenu({
  object,
}: {
  object: StatefulsetObjectQuery;
}) {
  const sealosContext = createSealosContext();
  const k8sContext = createK8sContext();

  const deleteLaunchpad = useDeleteLaunchpadMutation(sealosContext);
  const startLaunchpad = useStartLaunchpadMutation(sealosContext);
  const pauseLaunchpad = usePauseLaunchpadMutation(sealosContext);
  const removeFromProject = useRemoveFromProjectMutation(k8sContext);

  const { name, status } = object;

  const isRunning =
    status.replicas && status.replicas > 0 && status.unavailableReplicas === 0;

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
        {!isRunning && name && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              startLaunchpad.mutate({ name });
            }}
            disabled={startLaunchpad.isPending}
          >
            <Power className="mr-2 h-4 w-4" />
            Start
          </DropdownMenuItem>
        )}
        {isRunning && name && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              pauseLaunchpad.mutate({ name });
            }}
            disabled={pauseLaunchpad.isPending}
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
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            const statefulsetTarget = convertResourceTypeToTarget(
              "statefulset",
              name
            );
            removeFromProject.mutate({
              resources: [statefulsetTarget],
            });
          }}
          disabled={!name}
        >
          <PencilLine className="mr-2 h-4 w-4" />
          Remove from Project
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {name && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              deleteLaunchpad.mutate({ name });
            }}
            className="text-destructive"
            disabled={deleteLaunchpad.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
