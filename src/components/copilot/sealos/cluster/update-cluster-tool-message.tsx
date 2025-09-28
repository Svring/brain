"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { getClusterIconUrl } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";

interface UpdateClusterToolMessageProps {
  result: ToolActionResult;
}

export const UpdateClusterToolMessage: React.FC<UpdateClusterToolMessageProps> = ({
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
                Cluster
              </span>
              <span className="text-lg font-bold text-foreground leading-tight">
                {result.payload?.cluster_name &&
                result.payload.cluster_name.length > 15
                  ? `${result.payload.cluster_name.slice(0, 15)}...`
                  : result.payload?.cluster_name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        </div>
        {resourceChanges.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Updated to {resourceChanges.length === 1 ? "" : ""}{" "}
              {resourceChanges.map((change, index) => (
                <span key={index}>
                  {change}
                  {index < resourceChanges.length - 1 && " and "}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
