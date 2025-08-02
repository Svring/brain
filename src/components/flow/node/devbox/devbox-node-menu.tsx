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
import { getDevboxOptions } from "@/lib/sealos/devbox/devbox-method/devbox-query";
import {
  useDeleteDevboxMutation,
  useManageDevboxLifecycleMutation,
} from "@/lib/sealos/devbox/devbox-method/devbox-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export default function DevboxNodeMenu({ devboxName }: { devboxName: string }) {
  const k8sContext = createK8sContext();
  const devboxContext = createDevboxContext();

  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("devbox", devboxName)
  );
  const { data: status } = useQuery({
    ...getDevboxOptions(k8sContext, target),
    select: (data) => data?.status,
  });

  const deleteDevbox = useDeleteDevboxMutation(devboxContext);
  const manageDevboxLifecycle = useManageDevboxLifecycleMutation(devboxContext);

  if (!status) {
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
        {status !== "Running" && (
          <DropdownMenuItem
            onClick={() =>
              manageDevboxLifecycle.mutate({ devboxName, action: "start" })
            }
            disabled={status === "Pending"}
            className={status === "Pending" ? "opacity-50" : ""}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Start
          </DropdownMenuItem>
        )}
        {status !== "Stopped" && status !== "Shutdown" && (
          <DropdownMenuItem
            onClick={() =>
              manageDevboxLifecycle.mutate({ devboxName, action: "stop" })
            }
            disabled={status === "Pending"}
            className={status === "Pending" ? "opacity-50" : ""}
          >
            <Pause className="mr-2 h-4 w-4" />
            Stop
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() =>
            manageDevboxLifecycle.mutate({ devboxName, action: "restart" })
          }
          disabled={status === "Pending"}
          className={status === "Pending" ? "opacity-50" : ""}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Restart
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => deleteDevbox.mutate(devboxName)}
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
