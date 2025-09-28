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

interface DeleteDevboxToolMessageProps {
  result: ToolActionResult;
}

export const DeleteDevboxToolMessage: React.FC<
  DeleteDevboxToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { devbox } = useTRPCClients();

  console.log("result", result);

  useMount(() => {
    invalidateQueries([devbox.get.queryKey(), devbox.list.queryKey()], true);
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
      text: "Deleted",
    };
  };

  const { icon, text } = getStatusDisplay();

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex items-center gap-2">
          <img
            src={iconUrl}
            alt="Devbox Icon"
            width={32}
            height={32}
            className="rounded-lg h-8 w-8 flex-shrink-0 p-1 bg-muted"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col">
              <span
                className={`text-xs text-muted-foreground leading-none ${
                  isSuccess ? "line-through" : ""
                }`}
              >
                Devbox
              </span>
              <span
                className={`text-lg font-bold leading-tight ${
                  isSuccess
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {result.payload?.devbox_name &&
                result.payload.devbox_name.length > 15
                  ? `${result.payload.devbox_name.slice(0, 15)}...`
                  : result.payload?.devbox_name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        </div>
        {result.payload?.runtime && result.payload.runtime !== "default" && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Runtime:{" "}
              <span
                className={`font-mono text-foreground ${
                  isSuccess ? "line-through" : ""
                }`}
              >
                {result.payload.runtime.charAt(0).toUpperCase() +
                  result.payload.runtime.slice(1)}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
