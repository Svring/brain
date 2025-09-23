"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface GetDevboxMonitorToolMessageProps {
  result: ToolActionResult;
}

export const GetDevboxMonitorToolMessage: React.FC<
  GetDevboxMonitorToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { devbox } = useTRPCClients();

  useMount(() => {
    invalidateQueries([devbox.monitor.queryKey()]);
  });

  console.log("result", result);

  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          {isApproved ? (
            <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          ) : (
            <CircleSlash className="h-4 w-4 text-theme-yellow" />
          )}
          <p className="text-sm">
            {isApproved
              ? "Devbox monitoring data retrieved successfully"
              : "Devbox monitoring data retrieval rejected"}
          </p>
        </div>
      </div>
    </div>
  );
};
