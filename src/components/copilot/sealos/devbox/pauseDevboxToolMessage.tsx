"use client";

import React from "react";
import { DevboxPausePayload } from "@/components/chat/messages/tool-messages/tool-message-types";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-message-types";
import { Pause } from "lucide-react";

interface PauseDevboxToolMessageProps {
  result: ToolActionResult;
}

export const PauseDevboxToolMessage: React.FC<PauseDevboxToolMessageProps> = ({
  result,
}) => {
  const payload = result.payload as DevboxPausePayload;

  return (
    <div className="flex justify-start w-full">
      <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
        <div className="flex items-center gap-2 mb-3">
          <Pause className="h-4 w-4 text-yellow-600" />
          <h3 className="font-semibold text-foreground">Pause Devbox</h3>
        </div>
        
        <div className="space-y-2 text-sm text-foreground">
          <p><span className="font-medium">Name:</span> {payload.name}</p>
        </div>

        {result.success && (
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-yellow-800 text-sm">⏸️ {result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
