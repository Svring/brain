"use client";

import { Loader2 } from "lucide-react";
import { MessageRendererProps } from "./types";
import cardTypes from "../../action-cards/card-types";

export function RenderActionExecutionMessage({
  message,
  isCurrentMessage,
  inProgress,
}: MessageRendererProps) {
  const isLoading = isCurrentMessage && inProgress;
  const actionName = message.name;
  
  // Check if we have a custom card component for this action
  const CardComponent = actionName ? cardTypes[actionName] : null;

  // If we have a card component and arguments, render the card
  if (CardComponent && message.args) {
    return (
      <div className="max-w-full mr-auto">
        <div className="rounded-lg border bg-blue-50 border-blue-200">
          <div className="px-4 py-2 text-sm bg-blue-100 text-blue-800 border-b border-blue-200">
            <div className="font-medium mb-1">Executing Action</div>
            <div className="text-xs opacity-75">
              {actionName || "Running action..."}
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>
          <div className="p-2">
            <CardComponent data={message.args} actionName={actionName} />
          </div>
        </div>
      </div>
    );
  }

  // Default fallback for actions without custom cards
  return (
    <div className="max-w-full mr-auto">
      <div className="rounded-lg px-4 py-2 text-sm bg-blue-50 text-blue-800 border border-blue-200">
        <div className="font-medium mb-1">Executing Action</div>
        <div className="text-xs opacity-75">
          {actionName || "Running action..."}
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
