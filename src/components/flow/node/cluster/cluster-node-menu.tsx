"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pause, Trash2, PencilLine, Power } from "lucide-react";
import { createK8sContext, createClusterContext } from "@/lib/auth/auth-utils";
import {
  useDeleteClusterMutation,
  useStartClusterMutation,
  useStopClusterMutation,
} from "@/lib/sealos/cluster/cluster-method/cluster-mutation";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import useClusterNode from "@/hooks/sealos/cluster/use-cluster-node";

export default function ClusterNodeMenu({
  target,
}: {
  target: CustomResourceTarget;
}) {
  const k8sContext = createK8sContext();
  const clusterContext = createClusterContext();

  const { data: cluster, isLoading } = useClusterNode(k8sContext, target);

  const deleteCluster = useDeleteClusterMutation(clusterContext);
  const startCluster = useStartClusterMutation(clusterContext);
  const stopCluster = useStopClusterMutation(clusterContext);

  if (!cluster) {
    return null;
  }

  const { name: clusterName, status } = cluster;

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
              startCluster.mutate({ dbName: clusterName, dbType: cluster.type })
            }
            disabled={status === "Creating" || status === "Updating"}
            className={
              status === "Creating" || status === "Updating" ? "opacity-50" : ""
            }
          >
            <Power className="mr-2 h-4 w-4" />
            Start
          </DropdownMenuItem>
        )}
        {status !== "Stopped" && status !== "Shutdown" && (
          <DropdownMenuItem
            onClick={() =>
              stopCluster.mutate({ dbName: clusterName, dbType: cluster.type })
            }
            disabled={status === "Creating" || status === "Updating"}
            className={
              status === "Creating" || status === "Updating" ? "opacity-50" : ""
            }
          >
            <Pause className="mr-2 h-4 w-4" />
            Stop
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          disabled={status === "Creating" || status === "Updating"}
          className={
            status === "Creating" || status === "Updating" ? "opacity-50" : ""
          }
        >
          <PencilLine className="mr-2 h-4 w-4" />
          Update
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => deleteCluster.mutate({ name: clusterName })}
          className={`text-destructive ${
            status === "Creating" || status === "Updating" ? "opacity-50" : ""
          }`}
          disabled={status === "Creating" || status === "Updating"}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
