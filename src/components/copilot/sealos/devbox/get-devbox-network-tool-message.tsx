"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { NetworkChart } from "@/components/chat/messages/system-messages/components/network-chart";

interface GetDevboxNetworkToolMessageProps {
  result: ToolActionResult;
}

export const GetDevboxNetworkToolMessage: React.FC<
  GetDevboxNetworkToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { devbox } = useTRPCClients();

  useMount(() => {
    invalidateQueries([devbox.networkStatus.queryKey()]);
  });

  // Determine icon and text based on approved and success status
  const getStatusDisplay = () => {
    if (!isApproved) {
      return {
        icon: <CircleSlash className="h-4 w-4 text-theme-yellow" />,
        text: "Devbox network information retrieval rejected",
      };
    }

    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: result.message || "Devbox network information retrieval failed",
      };
    }

    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-green-600" />,
      text: "Devbox network information retrieved successfully",
    };
  };

  const { icon, text } = getStatusDisplay();

  // Check if we should render the NetworkChart
  const shouldRenderChart = isApproved &&
    isSuccess &&
    result.result &&
    result.result.combinedStatusData &&
    Array.isArray(result.result.combinedStatusData) &&
    result.result.combinedStatusData.length > 0;

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
      
      {/* Render NetworkChart if successful and has data */}
      {shouldRenderChart && (
        <div className="border rounded-lg p-2">
          <NetworkChart networkData={result.result} isLoading={false} />
        </div>
      )}
    </div>
  );
};
