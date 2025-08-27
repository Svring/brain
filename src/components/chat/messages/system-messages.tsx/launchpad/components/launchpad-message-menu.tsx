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
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceStart } from "@/hooks/sealos/resource/use-resource-start";
import { useResourcePause } from "@/hooks/sealos/resource/use-resource-pause";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface LaunchpadMessageMenuProps {
  target: BuiltinResourceTarget;
}

export default function LaunchpadMessageMenu({
  target,
}: LaunchpadMessageMenuProps) {
  const { launchpad: launchpadTrpcClient } = useTRPCClients();
  const queryClient = useQueryClient();

  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const launchpadName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  // Use the new resource hooks
  const startHook = useResourceStart(target);
  const pauseHook = useResourcePause(target);

  // Mutations using launchpad router
  const deleteLaunchpad = useMutation(
    launchpadTrpcClient.deleteLaunchpad.mutationOptions()
  );

  const handleDelete = () => {
    if (!launchpadName) return;
    deleteLaunchpad.mutate(
      { request: { name: launchpadName } },
      {
        onSuccess: () => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: launchpadTrpcClient.getLaunchpad.queryKey(target),
          });
        },
      }
    );
  };

  const handleStart = () => {
    if (!launchpadName) return;
    // startHook.start({ name: launchpadName });
  };

  const handlePause = () => {
    if (!launchpadName) return;
    // pauseHook.pause({ name: launchpadName });
  };

  // Don't render if we don't have a valid launchpad name
  if (!launchpadName) {
    return null;
  }

  // Determine if the launchpad is running based on status
  const isRunning = currentStatus === "Running";

  return (
    <div className="flex items-center gap-2">
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
          {!isRunning && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              disabled={startHook.isPending}
            >
              <Power className="mr-2 h-4 w-4" />
              Start
            </DropdownMenuItem>
          )}
          {isRunning && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handlePause();
              }}
              disabled={pauseHook.isPending}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
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
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-destructive"
            disabled={deleteLaunchpad.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
