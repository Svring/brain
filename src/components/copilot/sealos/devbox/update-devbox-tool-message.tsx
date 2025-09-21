"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-message-types";
import { CircleCheckBigIcon, CircleSlash } from "lucide-react";

interface UpdateDevboxToolMessageProps {
  result: ToolActionResult;
}

export const UpdateDevboxToolMessage: React.FC<
  UpdateDevboxToolMessageProps
> = ({ result }) => {
  const isApproved = result.approved !== false;

  return (
    <div className="w-full">
      <div className="flex items-center justify-center p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          {isApproved ? (
            <CircleCheckBigIcon className="h-4 w-4 text-theme-green" />
          ) : (
            <CircleSlash className="h-4 w-4 text-theme-yellow" />
          )}
          <p className="text-sm">
            {isApproved
              ? "Devbox updated successfully"
              : "Devbox update action rejected"}
          </p>
        </div>
      </div>
    </div>
  );
};
