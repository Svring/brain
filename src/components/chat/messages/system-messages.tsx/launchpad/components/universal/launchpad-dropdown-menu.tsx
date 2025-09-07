"use client";

import React from "react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Pause,
  RotateCcw,
  Trash2,
  Power,
} from "lucide-react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LaunchpadObject {
  name: string;
  status: string;
  resource?: any;
}

interface LaunchpadDropdownMenuProps {
  object: LaunchpadObject;
  onDelete?: (name: string) => void;
  showRestart?: boolean;
}

export default function LaunchpadDropdownMenu({
  object,
  onDelete,
  showRestart = true,
}: LaunchpadDropdownMenuProps) {
  const { name, status } = object;
  const isRunning = status === "Running";
  const isPending = status === "Pending";
  const { launchpad, k8s } = useTRPCClients();
  const queryClient = useQueryClient();

  const startLaunchpad = useMutation(
    launchpad.startLaunchpad.mutationOptions()
  );
  const pauseLaunchpad = useMutation(
    launchpad.pauseLaunchpad.mutationOptions()
  );

  const handleStart = () => {
    startLaunchpad.mutate(
      { name },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.getLaunchpad.queryKey({ name }),
          });
        },
      }
    );
  };

  const handlePause = () => {
    pauseLaunchpad.mutate(
      { name },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.getLaunchpad.queryKey({ name }),
          });
        },
      }
    );
  };

  return (
    <DropdownMenuContent
      className="rounded-xl bg-background-secondary"
      align="start"
    >
      {!isRunning && !isPending && (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleStart();
          }}
          onSelect={(e) => e.preventDefault()}
          disabled={isPending || startLaunchpad.isPending}
          className={isPending ? "opacity-50" : ""}
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
          onSelect={(e) => e.preventDefault()}
          disabled={isPending || pauseLaunchpad.isPending}
          className={isPending ? "opacity-50" : ""}
        >
          <Pause className="mr-2 h-4 w-4" />
          Pause
        </DropdownMenuItem>
      )}
      {isPending && (
        <>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }}
            onSelect={(e) => e.preventDefault()}
            disabled={true}
            className="opacity-50"
          >
            <Power className="mr-2 h-4 w-4" />
            Start
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handlePause();
            }}
            onSelect={(e) => e.preventDefault()}
            disabled={true}
            className="opacity-50"
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </DropdownMenuItem>
        </>
      )}
      {showRestart && (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // Restart functionality
          }}
          onSelect={(e) => e.preventDefault()}
          disabled={isPending}
          className={isPending ? "opacity-50" : ""}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Restart
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(name);
        }}
        onSelect={(e) => e.preventDefault()}
        className="text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
