"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { getClusterIconUrl } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";

interface PauseClusterToolMessageProps {
  result: ToolActionResult;
}

export const PauseClusterToolMessage: React.FC<PauseClusterToolMessageProps> = ({
  result,
}) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { cluster } = useTRPCClients();

  useMount(() => {
    invalidateQueries([cluster.get.queryKey()]);
  });

  // Get icon URL directly from type
  const iconUrl = getClusterIconUrl(result.payload?.type);

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
      text: "Paused",
    };
  };

  const { icon, text } = getStatusDisplay();

  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm">{text}</p>
        </div>
      </div>
    </div>
  );
};
