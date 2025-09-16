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
  const { setMessages } = useThreads();
  const { sendMessage } = useStreamContext();
  const router = useRouter();

  const { action, payload } = useMemo(() => {
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
      console.log("[ToolResultRenderer] onSuccess called with:", {
        id,
        action,
        successResult,
        tool_call_id,
        status,
      });

      if (id) {
        let updatedMessage: any = null;
        setMessages((prevMessages) => {
          // Remove the message with the same id from messages
          const filteredMessages = prevMessages.filter(
            (message) => message.id !== id
          );

          // Find and update the message to be updated
          const originalMessage = prevMessages.find(
            (message) => message.id === id
          );
          if (originalMessage) {
            updatedMessage = {
              ...originalMessage,
              additional_kwargs: {
                ...(originalMessage as any).additional_kwargs,
                result: successResult,
              },
            };
            console.log(
              "[ToolResultRenderer] Updated message:",
              updatedMessage
            );
          }

          return filteredMessages;
        });

        sendMessage([
          { type: "remove", id: id, content: "" },
          updatedMessage,
          { type: "system", role: "system", content: successResult },
        ]);
        // Check if this is a propose_project action and navigate to the project
        if (action === "propose_project" && successResult) {
          // successResult should be the project name
          router.push(`/projects/${successResult}`);
        }
      } else {
        console.warn(
          "[ToolResultRenderer] No message ID provided for onSuccess"
        );
      }
    };
  }, [
    result,
    id,
    setMessages,
    sendMessage,
    action,
    router,
    tool_call_id,
    status,
  ]);

  // Try to get the specific component for this action
  const Component = action ? get(ToolMessageType, action) : null;

  if (Component) {
    return Component(payload, result, onSuccess);
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
