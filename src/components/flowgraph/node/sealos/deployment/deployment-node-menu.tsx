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
import { createSealosContext } from "@/lib/auth/auth-utils";
import {
  useDeleteLaunchpadMutation,
  useStartLaunchpadMutation,
  usePauseLaunchpadMutation,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-mutation";
import { DeploymentObject } from "@/lib/sealos/resources/deployment/deployment-object-schema";
import { useRemoveFromProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

export default function DeploymentNodeMenu({
  object,
}: {
  object: DeploymentObject;
}) {
  const sealosContext = createSealosContext();
  const k8sContext = createK8sContext();

  const deleteLaunchpad = useDeleteLaunchpadMutation(sealosContext);
  const startLaunchpad = useStartLaunchpadMutation(sealosContext);
  const pauseLaunchpad = usePauseLaunchpadMutation(sealosContext);
  const removeFromProject = useRemoveFromProjectMutation(k8sContext);

  const {
    name,
    status: { replicas, unavailableReplicas, readyReplicas, paused },
  } = object;

  const isRunning = replicas === readyReplicas;

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
        {paused && name && (
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
        {!paused && isRunning && name && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              pauseLaunchpad.mutate({ name });
            }}
            disabled={pauseLaunchpad.isPending}
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </DropdownMenuItem>
        )}
        {unavailableReplicas && unavailableReplicas > 0 && name && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                startLaunchpad.mutate({ name });
              }}
              disabled={true}
            >
              <Power className="mr-2 h-4 w-4" />
              Start
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                pauseLaunchpad.mutate({ name });
              }}
              disabled={true}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </DropdownMenuItem>
          </>
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
            const deploymentTarget = convertResourceTypeToTarget(
              "deployment",
              name
            );
            removeFromProject.mutate({
              resources: [deploymentTarget],
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
