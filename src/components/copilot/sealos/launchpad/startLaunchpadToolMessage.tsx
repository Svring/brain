"use client";

import React from "react";
import { LaunchpadStartPayload } from "@/components/chat/messages/tool-messages/tool-message-types";
import { ToolActionResult } from "@/components/chat/messages/tool-messages/tool-message-types";
import { Play } from "lucide-react";

interface StartLaunchpadToolMessageProps {
  result: ToolActionResult;
}

export const StartLaunchpadToolMessage: React.FC<StartLaunchpadToolMessageProps> = ({
  result,
}) => {
  const payload = result.payload as LaunchpadStartPayload;

  return (
    <div className="flex justify-start w-full">
      <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
        <div className="flex items-center gap-2 mb-3">
          <Play className="h-4 w-4 text-green-600" />
          <h3 className="font-semibold text-foreground">Start Launchpad</h3>
        </div>
        
        <div className="space-y-2 text-sm text-foreground">
          <p><span className="font-medium">Name:</span> {payload.name}</p>
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
