"use client";

import React from "react";
import { DevboxUpdatePayload } from "@/components/chat/messages/tool-messages/tool-message-types";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-message-types";
import { Monitor } from "lucide-react";

interface UpdateDevboxToolMessageProps {
  result: ToolActionResult;
}

export const UpdateDevboxToolMessage: React.FC<UpdateDevboxToolMessageProps> = ({
  result,
}) => {
  const payload = result.payload as DevboxUpdatePayload;

  return (
    <div className="flex justify-start w-full">
      <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-foreground">Update Devbox</h3>
        </div>
        
        <div className="space-y-2 text-sm text-foreground">
          <p><span className="font-medium">Name:</span> {payload.name}</p>
          {payload.resource.cpu && (
            <p><span className="font-medium">CPU:</span> {payload.resource.cpu} cores</p>
          )}
          {payload.resource.memory && (
            <p><span className="font-medium">Memory:</span> {payload.resource.memory} GB</p>
          )}
        </div>

        {result.success && (
          <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded">
            <p className="text-green-800 text-sm">✅ {result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
