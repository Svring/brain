"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pause, Trash2, PencilLine, Power } from "lucide-react";
import { createClusterContext } from "@/lib/auth/auth-utils";
import {
  useDeleteClusterMutation,
  useStartClusterMutation,
  useStopClusterMutation,
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-mutation";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

export default function ClusterNodeMenu({ object }: { object: ClusterObject }) {
  const clusterContext = createClusterContext();

  const deleteCluster = useDeleteClusterMutation(clusterContext);
  const startCluster = useStartClusterMutation(clusterContext);
  const stopCluster = useStopClusterMutation(clusterContext);

  const { name: clusterName, status } = object;

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
              startCluster.mutate({
                dbName: clusterName,
                dbType: object.type,
              });
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              stopCluster.mutate({ dbName: clusterName, dbType: object.type });
            }}
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
          onClick={(e) => {
            e.stopPropagation();
            deleteCluster.mutate({ name: clusterName });
          }}
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
