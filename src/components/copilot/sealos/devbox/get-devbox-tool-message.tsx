"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface GetDevboxToolMessageProps {
  result: ToolActionResult;
}

export const GetDevboxToolMessage: React.FC<GetDevboxToolMessageProps> = ({
  result,
}) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { devbox } = useTRPCClients();

  useMount(() => {
    invalidateQueries([devbox.get.queryKey()]);
  });

  // Determine status display
  const getStatusDisplay = () => {
    if (!isApproved) {
      return {
        icon: <CircleSlash className="h-4 w-4 text-theme-yellow" />,
        text: "Devbox details retrieval rejected",
      };
    }

    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: "Devbox details retrieval failed",
      };
    }

    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-theme-green" />,
      text: "Devbox details retrieved successfully",
    };
  };

  const { icon, text } = getStatusDisplay();

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex items-center gap-2">
          <div className="rounded-lg h-8 w-8 flex-shrink-0 p-1 bg-muted flex items-center justify-center">
            <CircleCheckBigIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">
                Devbox Details
              </span>
              <span className="text-lg font-bold text-foreground leading-tight">
                {result.payload?.devbox_name &&
                result.payload.devbox_name.length > 15
                  ? `${result.payload.devbox_name.slice(0, 15)}...`
                  : result.payload?.devbox_name || "Devbox"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
