"use client";

import React from "react";
import { LaunchpadDeletePayload } from "@/components/chat/messages/tool-messages/tool-message-types";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-message-types";
import { Trash2 } from "lucide-react";

interface DeleteLaunchpadToolMessageProps {
  result: ToolActionResult;
}

export const DeleteLaunchpadToolMessage: React.FC<DeleteLaunchpadToolMessageProps> = ({
  result,
}) => {
  const payload = result.payload as LaunchpadDeletePayload;

  return (
    <div className="flex justify-start w-full">
      <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 className="h-4 w-4 text-red-600" />
          <h3 className="font-semibold text-foreground">Delete Launchpad</h3>
        </div>
        
        <div className="space-y-2 text-sm text-foreground">
          <p><span className="font-medium">Name:</span> {payload.name}</p>
        </div>

        {result.success && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded">
            <p className="text-red-800 text-sm">🗑️ {result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
