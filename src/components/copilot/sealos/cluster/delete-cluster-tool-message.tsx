"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface DeleteClusterToolMessageProps {
  result: ToolActionResult;
}

export const DeleteClusterToolMessage: React.FC<
  DeleteClusterToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { cluster } = useTRPCClients();

  useMount(() => {
    invalidateQueries([cluster.get.queryKey(), cluster.list.queryKey()], true);
  });

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
              ? "Cluster deleted successfully"
              : "Cluster deletion rejected"}
          </p>
        </div>
      </div>
    </div>
  );
};