"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  DEVBOX_RUNTIME_ICONS,
  DEVBOX_DEFAULT_ICON,
} from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";

interface UpdateDevboxToolMessageProps {
  result: ToolActionResult;
}

export const UpdateDevboxToolMessage: React.FC<
  UpdateDevboxToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { devbox } = useTRPCClients();

  console.log("result", result);

  useMount(() => {
    invalidateQueries([devbox.get.queryKey(), devbox.releases.queryKey()]);
  });

  // Get icon URL directly from runtime mapping
  const iconUrl =
    DEVBOX_RUNTIME_ICONS[
      result.payload?.runtime as keyof typeof DEVBOX_RUNTIME_ICONS
    ] || DEVBOX_DEFAULT_ICON;

  // Determine status display
  const getStatusDisplay = () => {
    if (!isApproved) {
      return {
        icon: <CircleSlash className="h-4 w-4 text-theme-yellow" />,
        text: "Devbox update rejected",
      };
    }

    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: "Devbox update failed",
      };
    }

    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-theme-green" />,
      text: "Devbox updated successfully:",
    };
  };

  const { icon, text } = getStatusDisplay();

  // Build resource change description with before/after comparison
  const getResourceChanges = () => {
    const changes = [];
    const beforeUpdate = result.payload?.before_update;
    const hasChanges = [];

    if (result.payload?.cpu !== undefined) {
      const oldCpu = beforeUpdate?.resources?.cpu;
      const newCpu = result.payload.cpu;

      if (oldCpu !== newCpu) {
        hasChanges.push(
          <span key="cpu" className="text-sm">
            CPU:{" "}
            <span className="line-through text-muted-foreground">{oldCpu}</span>{" "}
            → <span className="font-bold">{newCpu}</span> Core
          </span>
        );
      } else {
        hasChanges.push(
          <span key="cpu" className="text-sm">
            CPU <span className="font-bold">{newCpu}</span> Core
          </span>
        );
      }
    }

    if (result.payload?.memory !== undefined) {
      const oldMemory = beforeUpdate?.resources?.memory;
      const newMemory = result.payload.memory;

      if (oldMemory !== newMemory) {
        hasChanges.push(
          <span key="memory" className="mx-1 text-sm">
            Memory{" "}
            <span className="line-through text-muted-foreground">
              {oldMemory}
            </span>{" "}
            → <span className="font-bold">{newMemory}</span>G
          </span>
        );
      } else {
        hasChanges.push(
          <span key="memory" className="mx-1 text-sm">
            Memory <span className="font-bold">{newMemory}</span>G
          </span>
        );
      }
    }

    return hasChanges;
  };

  const resourceChanges = getResourceChanges();

  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm">
            {text}
            {resourceChanges.length > 0 && (
              <span className="ml-2">
                {resourceChanges.map((change, index) => (
                  <span key={index}>
                    {change}
                    {index < resourceChanges.length - 1 && ", "}
                  </span>
                ))}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
