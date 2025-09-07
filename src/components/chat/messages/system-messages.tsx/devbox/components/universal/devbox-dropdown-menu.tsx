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
  PencilLine,
} from "lucide-react";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DevboxDropdownMenuProps {
  object: DevboxObject;
  onDelete?: (devboxName: string) => void;
}

export default function DevboxDropdownMenu({
  object,
  onDelete,
}: DevboxDropdownMenuProps) {
  const { name: devboxName, status } = object;
  const { devbox } = useTRPCClients();
  const queryClient = useQueryClient();

  const startDevboxMutation = useMutation({
    ...devbox.startDevbox.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });

  const pauseDevboxMutation = useMutation({
    ...devbox.pauseDevbox.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });

  const restartDevboxMutation = useMutation({
    ...devbox.restartDevbox.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });

  return (
    <DropdownMenuContent
      className="rounded-xl bg-background-secondary"
      align="start"
    >
      {status !== "Running" && (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            startDevboxMutation.mutate(devboxName);
          }}
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          disabled={status === "Pending" || startDevboxMutation.isPending}
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
            pauseDevboxMutation.mutate(devboxName);
          }}
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          disabled={status === "Pending" || pauseDevboxMutation.isPending}
          className={status === "Pending" ? "opacity-50" : ""}
        >
          <Pause className="mr-2 h-4 w-4" />
          Pause
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          restartDevboxMutation.mutate(devboxName);
        }}
        onSelect={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        disabled={status === "Pending" || restartDevboxMutation.isPending}
        className={status === "Pending" ? "opacity-50" : ""}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Restart
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(devboxName);
        }}
        onSelect={(e) => {
          e.preventDefault();
          e.stopPropagation();
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
  );
}
