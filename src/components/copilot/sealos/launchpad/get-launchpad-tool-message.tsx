"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface GetLaunchpadToolMessageProps {
  result: ToolActionResult;
}

export const GetLaunchpadToolMessage: React.FC<GetLaunchpadToolMessageProps> = ({
  result,
}) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { launchpad } = useTRPCClients();

  useMount(() => {
    invalidateQueries([launchpad.get.queryKey()]);
  });

  const iconUrl = "https://applaunchpad.bja.sealos.run/logo.svg";

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
      text: "Retrieved",
    };
  };

  const { icon, text } = getStatusDisplay();

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex items-center gap-2">
          <img
            src={iconUrl}
            alt="Launchpad Icon"
            width={32}
            height={32}
            className="rounded-lg h-8 w-8 flex-shrink-0 p-1 bg-muted"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">
                Launchpad Details
              </span>
              <span className="text-lg font-bold text-foreground leading-tight">
                {result.payload?.launchpad_name &&
                result.payload.launchpad_name.length > 15
                  ? `${result.payload.launchpad_name.slice(0, 15)}...`
                  : result.payload?.launchpad_name || "Launchpad"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        </div>
        {result.payload?.image && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Image:{" "}
              <span className="font-mono text-foreground">
                {result.payload.image.length > 20
                  ? `${result.payload.image.slice(0, 20)}...`
                  : result.payload.image}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
