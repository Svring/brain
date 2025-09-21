"use client";

import React from "react";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-message-types";
import { CircleCheckBigIcon, CircleSlash } from "lucide-react";

interface UpdateLaunchpadImageToolMessageProps {
  result: ToolActionResult;
}

export const UpdateLaunchpadImageToolMessage: React.FC<UpdateLaunchpadImageToolMessageProps> = ({
  result,
}) => {
  const isApproved = result.approved !== false;

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
              ? "Launchpad image updated successfully"
              : "Launchpad image update rejected"}
          </p>
        </div>
      </div>
    </div>
  );
};
