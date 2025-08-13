"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pause,
  RotateCcw,
  Trash2,
  PencilLine,
} from "lucide-react";
import { createDevboxContext } from "@/lib/auth/auth-utils";
import {
  useDeleteDevboxMutation,
  useManageDevboxLifecycleMutation,
} from "@/lib/sealos/resources/devbox/devbox-method/devbox-mutation";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useRemoveFromProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

export default function DevboxNodeMenu({ object }: { object: DevboxObject }) {
  const devboxContext = createDevboxContext();
  const k8sContext = createK8sContext();

  const deleteDevbox = useDeleteDevboxMutation(devboxContext);
  const manageDevboxLifecycle = useManageDevboxLifecycleMutation(devboxContext);
  const removeFromProject = useRemoveFromProjectMutation(k8sContext);

  const { name: devboxName, status } = object;

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
        {status !== "Running" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              manageDevboxLifecycle.mutate({ devboxName, action: "start" });
            }}
            disabled={status === "Pending"}
            className={status === "Pending" ? "opacity-50" : ""}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Start
          </DropdownMenuItem>
        )}
        {status !== "Stopped" && status !== "Shutdown" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              manageDevboxLifecycle.mutate({ devboxName, action: "stop" });
            }}
            disabled={status === "Pending"}
            className={status === "Pending" ? "opacity-50" : ""}
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            manageDevboxLifecycle.mutate({ devboxName, action: "restart" });
          }}
          disabled={status === "Pending"}
          className={status === "Pending" ? "opacity-50" : ""}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Restart
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // Convert devbox to resource target format for the mutation
            const devboxTarget = convertResourceTypeToTarget("devbox", devboxName);
            removeFromProject.mutate({
              resources: [devboxTarget],
            });
          }}
          disabled={status === "Pending"}
          className={status === "Pending" ? "opacity-50" : ""}
        >
          <PencilLine className="mr-2 h-4 w-4" />
          Remove from Project
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            deleteDevbox.mutate(devboxName);
          }}
          className={`text-destructive ${
            status === "Pending" ? "opacity-50" : ""
          }`}
          disabled={status === "Pending"}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
