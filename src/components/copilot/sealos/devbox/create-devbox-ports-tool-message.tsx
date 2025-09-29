"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-result-message-types";
import { CircleCheckBigIcon, CircleSlash, Ban } from "lucide-react";
import { useMount } from "@reactuses/core";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface CreateDevboxPortsToolMessageProps {
  result: ToolActionResult;
}

export const CreateDevboxPortsToolMessage: React.FC<
  CreateDevboxPortsToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;
  const isSuccess = result.success !== false;
  const { invalidateQueries } = useInvalidateQueries();
  const { devbox } = useTRPCClients();

  console.log("result", result);

  useMount(() => {
    invalidateQueries([devbox.get.queryKey(), devbox.list.queryKey()]);
  });

  // Determine icon and text based on approved and success status
  const getStatusDisplay = () => {
    if (!isApproved) {
      return {
        icon: <CircleSlash className="h-4 w-4 text-theme-yellow" />,
        text: "Devbox ports creation rejected",
      };
    }

    if (!isSuccess) {
      return {
        icon: <Ban className="h-4 w-4 text-theme-red" />,
        text: "Devbox ports creation failed",
      };
    }

    const createdPorts = result.payload?.ports || [];
    const portsText =
      createdPorts.length > 0
        ? `Ports ${createdPorts.join(", ")} created successfully`
        : "Devbox ports created successfully";

    return {
      icon: <CircleCheckBigIcon className="h-4 w-4 text-green-600" />,
      text: portsText,
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
