"use client";

import React from "react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import LaunchpadIconButtons from "./universal/launchpad-icon-buttons";

interface LaunchpadMessageMenuProps {
  target: BuiltinResourceTarget;
}

export default function LaunchpadMessageMenu({
  target,
}: LaunchpadMessageMenuProps) {
  const { launchpad, k8s } = useTRPCClients();
  const queryClient = useQueryClient();

  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const launchpadName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  const deleteLaunchpad = useMutation(
    launchpad.delete.mutationOptions()
  );

  const handleDelete = () => {
    deleteLaunchpad.mutate(
      { name: launchpadName },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: k8s.list.queryKey(),
          });
        },
      }
    );
  };

  // Create a LaunchpadObject from the target
  const launchpadObject = {
    name: launchpadName,
    status: currentStatus,
    resource: resource,
  };

  // Don't render if we don't have a valid launchpad name
  if (!launchpadName) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <LaunchpadIconButtons
        object={launchpadObject}
        onDelete={(name) => {
          handleDelete();
        }}
        showRestart={true}
      />
    </div>
  );
}
