"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { getClusterIconUrl } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";

interface GetClusterToolMessageProps {
  result: ToolActionResult;
}

export const GetClusterToolMessage: React.FC<GetClusterToolMessageProps> = ({
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
        text: "Cluster details retrieval rejected",
      };
    }

    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: "Cluster details retrieval failed",
      };
    }

    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-theme-green" />,
      text: "Cluster details retrieved successfully",
    };
  };

  const { icon, text } = getStatusDisplay();

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex items-center gap-2">
          <img
            src={iconUrl}
            alt={`${result.payload?.type} Icon`}
            width={32}
            height={32}
            className="rounded-lg h-8 w-8 flex-shrink-0 p-1 bg-muted"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">
                Cluster Details
              </span>
              <span className="text-lg font-bold text-foreground leading-tight">
                {result.payload?.cluster_name &&
                result.payload.cluster_name.length > 15
                  ? `${result.payload.cluster_name.slice(0, 15)}...`
                  : result.payload?.cluster_name || "Cluster"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        </div>
        {result.payload?.type && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Type:{" "}
              <span className="font-mono text-foreground">
                {result.payload.type.charAt(0).toUpperCase() +
                  result.payload.type.slice(1)}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
