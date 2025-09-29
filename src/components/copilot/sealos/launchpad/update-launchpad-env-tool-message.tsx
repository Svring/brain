"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface UpdateLaunchpadEnvToolMessageProps {
  result: ToolActionResult;
}

export const UpdateLaunchpadEnvToolMessage: React.FC<
  UpdateLaunchpadEnvToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { launchpad } = useTRPCClients();

  useMount(() => {
    invalidateQueries([launchpad.get.queryKey(), launchpad.list.queryKey()]);
  });

  // Determine icon and text based on approved and success status
  const getStatusDisplay = () => {
    if (!isApproved) {
      return {
        icon: <CircleSlash className="h-4 w-4 text-theme-yellow" />,
        text: "Launchpad environment variable update rejected"
      };
    }
    
    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: result.message || "Launchpad environment variable update failed"
      };
    }
    
    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-theme-green" />,
      text: "Launchpad environment variable updated successfully"
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
