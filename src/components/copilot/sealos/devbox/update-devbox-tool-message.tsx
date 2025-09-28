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

  // console.log("result", result);

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
        text: "Rejected",
      };
    }

    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: "Failed",
      };
    }

    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-theme-green" />,
      text: "Updated",
    };
  };

  const { icon, text } = getStatusDisplay();

  // Build resource change description
  const getResourceChanges = () => {
    const changes = [];
    if (result.payload?.cpu !== undefined) {
      changes.push(
        <span key="cpu">
          <span className="font-mono font-bold text-foreground">{result.payload.cpu}Core</span>{" "}
          CPU
        </span>
      );
    }
    if (result.payload?.memory !== undefined) {
      changes.push(
        <span key="memory">
          <span className="font-mono font-bold text-foreground">{result.payload.memory}G</span>{" "}
          Memory
        </span>
      );
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
                - Updated to {resourceChanges.map((change, index) => (
                  <span key={index}>
                    {change}
                    {index < resourceChanges.length - 1 && " and "}
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
