"use client";

import { memo, useMemo } from "react";
import { get } from "lodash";
import { useRouter } from "next/navigation";
import { ToolMessageType } from "../messages/tool-messages/tool-message-types";
import { useThreads } from "@/components/provider/thread-provider";
import { useStreamContext } from "@/components/provider/stream-provider";

interface ToolResultRendererProps {
  content: string;
  result?: any;
  id?: string;
  tool_call_id?: string;
  status?: string;
}

export const ToolResultRenderer = memo(function ToolResultRenderer({
  content,
  result,
  id,
  tool_call_id,
  status,
}: ToolResultRendererProps) {
  const { action, payload } = useMemo(() => {
    // console.log("content", content);
    try {
      // First try to parse the outer content
      const outerParsed = JSON.parse(content);
      // If it has an action and payload, return them
      if (outerParsed.action && outerParsed.payload) {
        return {
          action: outerParsed.action,
          payload: outerParsed.payload,
        };
      }

      // If it's just a string, return as is
      return {
        action: null,
        payload: { content: content },
      };
    } catch {
      // If parsing fails, return the content as plain text
      return {
        action: null,
        payload: { content: content },
      };
    }
  }, [content]);

  // Create onSuccess function when result is not present
  const onSuccess = useMemo(() => {
    if (result) return undefined; // Don't provide onSuccess if result is already present

    return (successResult: any) => {
      // Empty body for now
    };
  }, [result, action]);

  // Try to get the specific component for this action
  const Component = action ? get(ToolMessageType, action) : null;

  if (Component) {
    // Check if this is one of the new tool message types that only accepts result
    const toolMessageActions = [
      "update_devbox",
      "start_devbox",
      "pause_devbox",
      "delete_devbox",
      "update_cluster",
      "start_cluster",
      "pause_cluster",
      "delete_cluster",
      "update_launchpad",
      "start_launchpad",
      "pause_launchpad",
      "delete_launchpad",
    ];

    if (toolMessageActions.includes(action)) {
      // For tool message components, create a ToolActionResult object
      const toolActionResult = {
        action,
        payload,
        success: true,
        result,
        message:
          result?.message ||
          `${action.replace("_", " ")} completed successfully`,
      };
      return Component(toolActionResult);
    } else {
      // For other components, use the old signature
      return Component(payload, result, onSuccess);
    }
  }

  // Fallback to plain text rendering
  return (
    <div className="flex justify-start w-full">
      <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
        <div className="text-sm text-foreground">
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
});
