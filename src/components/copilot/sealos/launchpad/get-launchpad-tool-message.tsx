"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-message-types";
import { CircleCheckBigIcon } from "lucide-react";

interface GetLaunchpadToolMessageProps {
  result: ToolActionResult;
}

export const GetLaunchpadToolMessage: React.FC<GetLaunchpadToolMessageProps> = ({
  result,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon className="h-4 w-4 text-green-600" />
          <p className="text-sm">Launchpad details retrieved successfully</p>
        </div>
      </div>
    </div>
  );
};
