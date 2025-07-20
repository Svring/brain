"use client";

import { Loader2 } from "lucide-react";
import { MessageRendererProps } from "./types";

export function RenderActionExecutionMessage({
  message,
  isCurrentMessage,
  inProgress,
}: MessageRendererProps) {
  const isLoading = isCurrentMessage && inProgress;

  return (
    <div className="max-w-[85%] mr-auto">
      <div className="rounded-lg px-4 py-2 text-sm bg-blue-50 text-blue-800 border border-blue-200">
        <div className="font-medium mb-1">Executing Action</div>
        <div className="text-xs opacity-75">
          {message.name || "Running action..."}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}