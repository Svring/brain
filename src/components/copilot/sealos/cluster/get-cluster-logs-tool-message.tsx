"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { LogChart } from "@/components/chat/messages/system-messages/components/log-chart";

interface GetClusterLogsToolMessageProps {
  result: ToolActionResult;
}

export const GetClusterLogsToolMessage: React.FC<
  GetClusterLogsToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { cluster } = useTRPCClients();

  useMount(() => {
    invalidateQueries([cluster.logs.queryKey()]);
  });

  // Determine icon and text based on approved and success status
  const getStatusDisplay = () => {
    if (!isApproved) {
      return {
        icon: <CircleSlash className="h-4 w-4 text-theme-yellow" />,
        text: "Cluster logs retrieval rejected",
      };
    }

    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: result.message || "Cluster logs retrieval failed",
      };
    }

    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-green-600" />,
      text: "Cluster logs retrieved successfully",
    };
  };

  const { icon, text } = getStatusDisplay();

  console.log("result.result.logs", result);

  // Check if we should render the LogChart
  const shouldRenderChart = isApproved && isSuccess && result.result;

  return (
    <div className="w-full">
      {/* Only show status message if chart is not rendered */}
      {!shouldRenderChart && (
        <div className="flex items-center justify-center p-2 border rounded-lg">
          <div className="flex items-center gap-2">
            {icon}
            <p className="text-sm">{text}</p>
          </div>
        </div>
      )}

      {/* Render LogChart if successful and has data */}
      {shouldRenderChart && (
        <LogChart logsData={result.result} isLoading={false} />
      )}
    </div>
  );
};
