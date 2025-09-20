/**
 * Utility functions for working with pending messages
 *
 * This file demonstrates how to use the pending message system.
 * These are example utilities - no consumption mechanism is implemented yet.
 */

import { Message } from "@langchain/langgraph-sdk";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export interface PendingMessageExample {
  // Example: Create a user message for pending storage
  createUserMessage: (content: string) => Message;

  // Example: Create an assistant message for pending storage
  createAssistantMessage: (content: string) => Message;

  // Example: Get pending message count for a target
  getPendingMessageCount: (
    pendingMessages: Map<string, Message[]>,
    resourceTarget: ResourceTarget | null
  ) => number;
}

/**
 * Example utility functions for pending messages
 */
export const pendingMessageUtils: PendingMessageExample = {
  createUserMessage: (content: string): Message => ({
    id: `pending-${Date.now()}-${Math.random()}`,
    type: "human",
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),

  createAssistantMessage: (content: string): Message => ({
    id: `pending-${Date.now()}-${Math.random()}`,
    type: "ai",
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),

  getPendingMessageCount: (
    pendingMessages: Map<string, Message[]>,
    resourceTarget: ResourceTarget | null
  ): number => {
    const key = resourceTarget ? JSON.stringify(resourceTarget) : "__project__";
    return pendingMessages.get(key)?.length || 0;
  },
};

/**
 * Example usage patterns:
 *
 * // Add a pending message for a resource
 * const { addPendingMessage } = useChatActions();
 * const message = pendingMessageUtils.createUserMessage("Hello world");
 * addPendingMessage(resourceTarget, message);
 *
 * // Add a pending message for project chat
 * addPendingMessage(null, message);
 *
 * // Get pending messages for a target
 * const { getPendingMessages } = useChatState();
 * const messages = getPendingMessages(resourceTarget);
 *
 * // Check if target has pending messages
 * const { hasPendingMessages } = useChatState();
 * const hasMessages = hasPendingMessages(resourceTarget);
 *
 * // Remove a specific pending message by index
 * const { removePendingMessage } = useChatActions();
 * removePendingMessage(resourceTarget, 0); // Remove first message
 *
 * // Clear all pending messages for a target
 * const { clearPendingMessages } = useChatActions();
 * clearPendingMessages(resourceTarget);
 */
