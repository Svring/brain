"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface UpdateLaunchpadToolMessageProps {
  result: ToolActionResult;
}

export const UpdateLaunchpadToolMessage: React.FC<
  UpdateLaunchpadToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { launchpad } = useTRPCClients();

  useMount(() => {
    invalidateQueries([launchpad.get.queryKey(), launchpad.list.queryKey()]);
  });

  const iconUrl = "https://applaunchpad.bja.sealos.run/logo.svg";

  // Determine status display
  const getStatusDisplay = () => {
    if (!isApproved) {
      return {
        icon: <CircleSlash className="h-4 w-4 text-theme-yellow" />,
        text: "Launchpad update rejected",
      };
    }

    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: "Launchpad update failed",
      };
    }

    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-theme-green" />,
      text: "Launchpad updated successfully:",
    };
  };

  const { icon, text } = getStatusDisplay();

  // Build resource change description with before/after comparison
  const getResourceChanges = () => {
    const changes = [];
    const beforeUpdate = result.payload?.before_update;

    if (result.payload?.cpu !== undefined) {
      const oldCpu = beforeUpdate?.resource?.cpu;
      const newCpu = result.payload.cpu;

      if (oldCpu !== newCpu) {
        changes.push(
          <span key="cpu" className="text-sm">
            CPU:{" "}
            <span className="line-through text-muted-foreground">{oldCpu}</span>{" "}
            → <span className="font-bold">{newCpu}</span> Core
          </span>
        );
      } else {
        changes.push(
          <span key="cpu" className="text-sm">
            CPU <span className="font-bold">{newCpu}</span> Core
          </span>
        );
      }
    }

    if (result.payload?.memory !== undefined) {
      const oldMemory = beforeUpdate?.resource?.memory;
      const newMemory = result.payload.memory;

      if (oldMemory !== newMemory) {
        changes.push(
          <span key="memory" className="text-sm">
            Memory:{" "}
            <span className="line-through text-muted-foreground">{oldMemory}</span>{" "}
            → <span className="font-bold">{newMemory}</span>G
          </span>
        );
      } else {
        changes.push(
          <span key="memory" className="text-sm">
            Memory <span className="font-bold">{newMemory}</span>G
          </span>
        );
      }
    }

    return changes;
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
