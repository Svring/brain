"use client";

import { get } from "lodash";
import { useRouter } from "next/navigation";
import { memo, useMemo } from "react";
import { ToolMessageType } from "../messages/tool-messages/tool-result-message-types";

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
  const { action, payload, approved, success, parsedResult } = useMemo(() => {
    try {
      // First try to parse the outer content
      const outerParsed = JSON.parse(content);
      // If it has an action and payload, return them
      if (outerParsed.action && outerParsed.payload) {
        return {
          action: outerParsed.action,
          payload: outerParsed.payload,
          approved: outerParsed.approved,
          success: outerParsed.success,
          parsedResult: outerParsed.result || null,
        };
      }

      // If it's just a string, return as is
      return {
        action: null,
        payload: { content: content },
        approved: undefined,
        success: undefined,
        parsedResult: null,
      };
    } catch {
      // If parsing fails, return the content as plain text
      return {
        action: null,
        payload: { content: content },
        approved: undefined,
        success: undefined,
        parsedResult: null,
      };
    }
  }, [content]);

  // Use parsed result from content if result prop is null or undefined
  const effectiveResult = result != null ? result : parsedResult;

  // Create onSuccess function when result is not present
  const onSuccess = useMemo(() => {
    if (effectiveResult) return undefined; // Don't provide onSuccess if result is already present

    return (successResult: any) => {
      // Empty body for now
    };
  }, [effectiveResult, action]);

  // Try to get the specific component for this action
  const Component = action ? get(ToolMessageType, action) : null;

  if (Component) {
    // Check if this is one of the new tool message types that only accepts result
    const toolMessageActions = [
      // Devbox tools
      "get_devbox",
      "get_devbox_monitor",
      "get_devbox_network",
      "update_devbox",
      "create_devbox_ports",
      "delete_devbox_ports",
      "start_devbox",
      "restart_devbox",
      "pause_devbox",
      "autostart_devbox",
      "create_devbox",
      "delete_devbox",
      "get_devbox_release",
      "deploy_devbox_release",

      // Cluster tools
      "get_cluster",
      "get_cluster_logs",
      "get_cluster_monitor",
      "update_cluster",
      "start_cluster",
      "restart_cluster",
      "pause_cluster",
      "create_cluster",
      "delete_cluster",

      // Launchpad tools
      "get_launchpad",
      "get_launchpad_logs",
      "get_launchpad_monitor",
      "get_launchpad_network",
      "update_launchpad",
      "create_launchpad_ports",
      "delete_launchpad_ports",
      "create_launchpad_env",
      "delete_launchpad_env",
      "update_launchpad_env",
      "update_launchpad_image",
      "update_launchpad_command",
      "start_launchpad",
      "restart_launchpad",
      "pause_launchpad",
      "create_launchpad",
      "delete_launchpad",

      // Suggestion tool
      "suggestion",
    ];

    if (toolMessageActions.includes(action)) {
      // For tool message components, create a ToolActionResult object
      const toolActionResult = {
        action,
        payload,
        success: success !== undefined ? success : true,
        result: effectiveResult,
        message:
          effectiveResult?.message ||
          `${action.replace("_", " ")} completed successfully`,
        approved: approved !== undefined ? approved : true,
      };
      return Component(toolActionResult);
    } else {
      // For other components, use the old signature
      return Component(payload, effectiveResult, onSuccess);
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
