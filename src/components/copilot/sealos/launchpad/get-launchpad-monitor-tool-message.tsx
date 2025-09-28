"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { CombinedMetricsChart } from "@/components/chat/messages/system-messages/components/combined-metrics-chart";

interface GetLaunchpadMonitorToolMessageProps {
  result: ToolActionResult;
}

export const GetLaunchpadMonitorToolMessage: React.FC<GetLaunchpadMonitorToolMessageProps> = ({
  result,
}) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { launchpad } = useTRPCClients();

  useMount(() => {
    invalidateQueries([launchpad.monitor.queryKey()]);
  });

  // Determine icon and text based on approved and success status
  const getStatusDisplay = () => {
    if (!isApproved) {
      return {
        icon: <CircleSlash className="h-4 w-4 text-theme-yellow" />,
        text: "Launchpad monitoring data retrieval rejected"
      };
    }
    
    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: result.message || "Launchpad monitoring data retrieval failed"
      };
    }
    
    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-green-600" />,
      text: "Launchpad monitoring data retrieved successfully"
    };
  };

  const { icon, text } = getStatusDisplay();

  // Check if we should render the CombinedMetricsChart
  const shouldRenderChart = isApproved &&
    isSuccess &&
    result.result &&
    Array.isArray(result.result) &&
    result.result.length > 0;

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
      
      {/* Render CombinedMetricsChart if successful and has data */}
      {shouldRenderChart && (
        <div className="border rounded-lg p-4">
          <CombinedMetricsChart data={result.result} isLoading={false} />
        </div>
      )}
    </div>
  );
};
