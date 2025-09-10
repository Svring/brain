"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import DevboxDropdownMenu from "./universal/devbox-dropdown-menu";

interface DevboxMessageMenuProps {
  target: CustomResourceTarget;
}

export default function DevboxMessageMenu({ target }: DevboxMessageMenuProps) {
  // Extract name and status from the target using the hook
  const { resource, status } = useResourceStatus(target);
  const devboxName = resource?.name || target.name || "";
  const currentStatus = status || "Pending";

  // Create a DevboxObject from the target
  const devboxObject = {
    name: devboxName,
    status: currentStatus,
    // Add other required properties if needed
  } as DevboxObject;

  // Don't render if we don't have a valid devbox name
  if (!devboxName) {
    return null;
  }

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
        <DevboxDropdownMenu
          object={devboxObject}
          onDelete={(devboxName) => {
            // Handle delete callback if needed
            console.log("Delete devbox:", devboxName);
          }}
        />
      </DropdownMenu>
    </div>
  );
}
