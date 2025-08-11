"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
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
import { createK8sContext, createDevboxContext } from "@/lib/auth/auth-utils";
import {
  useDeleteDevboxMutation,
  useManageDevboxLifecycleMutation,
} from "@/lib/sealos/devbox/devbox-method/devbox-mutation";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import useDevboxNode from "@/hooks/sealos/devbox/use-devbox-node";

export default function DevboxNodeMenu({
  target,
}: {
  target: CustomResourceTarget;
}) {
  const k8sContext = createK8sContext();
  const devboxContext = createDevboxContext();

  const { data, isLoading } = useDevboxNode(k8sContext, target);

  const deleteDevbox = useDeleteDevboxMutation(devboxContext);
  const manageDevboxLifecycle = useManageDevboxLifecycleMutation(devboxContext);

  if (isLoading || !data) {
    return null;
  }

  const { name: devboxName, status } = data;

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
            Stop
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
