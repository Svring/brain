"use client";

import { assign, createMachine } from "xstate";
import { Thread, Message } from "@langchain/langgraph-sdk";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export interface ChatSectionState {
  open: boolean;
  responding: boolean;
  maximized: boolean;
  loading: boolean;
}

export interface ChatInstance {
  threadId: string | null;
  threads: Thread[];
  state: ChatSectionState;
  resourceTarget?: ResourceTarget; // undefined for project chat
  projectName?: string; // defined for project chat instances
}

export interface ChatContextState {
  chatInstances: Map<string, ChatInstance>; // Map<resourceTarget, ChatInstance>
  activeResourceTargets: string[];
  focusedResourceTarget: string | null;
  pendingMessages: Map<string, Message[]>; // Map<resourceTarget, Message[]> - stores pending messages for each target
  chatDisplayOrder: string[]; // Array of chat keys in display order (newest first)
  triggerPendingMessages: Map<string, boolean>; // Map<resourceTarget, boolean> - triggers pending message submission
}

export type ChatEvent =
  // Multi-instance chat management
  | { type: "OPEN_CHAT"; resourceTarget: ResourceTarget }
  | { type: "CLOSE_CHAT"; resourceTarget: ResourceTarget }

  // Project chat management
  | { type: "OPEN_PROJECT_CHAT"; projectName: string }
  | { type: "CLOSE_PROJECT_CHAT"; projectName: string }

  // Per-instance state management (for resource chats)
  | {
      type: "SET_CHAT_THREAD_ID";
      resourceTarget: ResourceTarget;
      threadId: string | null;
    }
  | {
      type: "SET_CHAT_THREADS";
      resourceTarget: ResourceTarget;
      threads: Thread[];
    }
  | {
      type: "SET_CHAT_STATE";
      resourceTarget: ResourceTarget;
      state: Partial<ChatSectionState>;
    }

  // Per-instance state management (for project chat)
  | {
      type: "SET_PROJECT_CHAT_THREAD_ID";
      projectName: string;
      threadId: string | null;
    }
  | {
      type: "SET_PROJECT_CHAT_THREADS";
      projectName: string;
      threads: Thread[];
    }
  | {
      type: "SET_PROJECT_CHAT_STATE";
      projectName: string;
      state: Partial<ChatSectionState>;
    }

  // Pending message management
  | {
      type: "ADD_PENDING_MESSAGE";
      resourceTarget: ResourceTarget | null; // null for project chat
      message: Message;
    }
  | {
      type: "REMOVE_PENDING_MESSAGE";
      resourceTarget: ResourceTarget | null; // null for project chat
      messageIndex: number;
    }
  | {
      type: "CLEAR_PENDING_MESSAGES";
      resourceTarget: ResourceTarget | null; // null for project chat
    }
  // Trigger pending message submission
  | {
      type: "TRIGGER_PENDING_MESSAGES";
      resourceTarget: ResourceTarget | null; // null for project chat
    }
  | {
      type: "CLEAR_TRIGGER_PENDING_MESSAGES";
      resourceTarget: ResourceTarget | null; // null for project chat
    };

// Helper function to serialize resource target to string key
export function serializeResourceTarget(
  resourceTarget: ResourceTarget
): string {
  return JSON.stringify(resourceTarget);
}

// Helper function to create project chat key
export function getProjectChatKey(projectName: string): string {
  return `__project__${projectName}`;
}

// Helper function to serialize resource target or project name to string key
export function serializeTargetKey(
  resourceTarget: ResourceTarget | null,
  projectName?: string
): string {
  if (resourceTarget) {
    return serializeResourceTarget(resourceTarget);
  }
  // For project chat, use projectName if provided
  if (projectName) {
    return getProjectChatKey(projectName);
  }
  // Fallback for backward compatibility
  return "__project__";
}

export const chatMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: ChatContextState; events: ChatEvent },
  id: "chat",
  initial: "idle",
  context: {
    chatInstances: new Map<string, ChatInstance>(),
    activeResourceTargets: [],
    focusedResourceTarget: null,
    pendingMessages: new Map<string, Message[]>(),
    chatDisplayOrder: [],
    triggerPendingMessages: new Map<string, boolean>(),
  },
  states: {
    idle: {},
  },
  on: {
    // Multi-instance chat management
    OPEN_CHAT: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const resourceKey = serializeResourceTarget(event.resourceTarget);

          // Check if chat already exists for this resource
          if (newInstances.has(resourceKey)) {
            // Chat already exists, just return existing instances
            return newInstances;
          }

          // Create new chat instance
          const newInstance: ChatInstance = {
            threadId: null,
            threads: [],
            state: {
              open: true,
              responding: false,
              maximized: false,
              loading: false,
            },
            resourceTarget: event.resourceTarget,
          };

          newInstances.set(resourceKey, newInstance);
          return newInstances;
        },
        activeResourceTargets: ({ context, event }) => {
          const resourceKey = serializeResourceTarget(event.resourceTarget);

          // Add to active list if not already there
          return context.activeResourceTargets.includes(resourceKey)
            ? context.activeResourceTargets
            : [...context.activeResourceTargets, resourceKey];
        },
        focusedResourceTarget: ({ event }) => {
          return serializeResourceTarget(event.resourceTarget);
        },
        chatDisplayOrder: ({ context, event }) => {
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          const newOrder = [...context.chatDisplayOrder];

          // Remove the key if it already exists
          const existingIndex = newOrder.indexOf(resourceKey);
          if (existingIndex > -1) {
            newOrder.splice(existingIndex, 1);
          }

          // Add to the beginning (newest first)
          newOrder.unshift(resourceKey);
          return newOrder;
        },
      }),
    },

    CLOSE_CHAT: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          newInstances.delete(resourceKey);
          return newInstances;
        },
        activeResourceTargets: ({ context, event }) => {
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          return context.activeResourceTargets.filter(
            (target) => target !== resourceKey
          );
        },
        focusedResourceTarget: ({ context, event }) => {
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          return context.focusedResourceTarget === resourceKey
            ? null
            : context.focusedResourceTarget;
        },
        chatDisplayOrder: ({ context, event }) => {
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          return context.chatDisplayOrder.filter((key) => key !== resourceKey);
        },
      }),
    },

    // Project chat management
    OPEN_PROJECT_CHAT: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const projectChatKey = getProjectChatKey(event.projectName);

          // Check if project chat already exists
          let projectInstance = newInstances.get(projectChatKey);
          if (!projectInstance) {
            // Create new project chat instance
            projectInstance = {
              threadId: null,
              threads: [],
              state: {
                open: true,
                responding: false,
                maximized: false,
                loading: false,
              },
              projectName: event.projectName,
            };
          } else {
            // Update existing instance to open
            projectInstance.state.open = true;
          }

          newInstances.set(projectChatKey, projectInstance);
          return newInstances;
        },
        focusedResourceTarget: ({ event }) =>
          getProjectChatKey(event.projectName),
        chatDisplayOrder: ({ context, event }) => {
          const projectChatKey = getProjectChatKey(event.projectName);
          const newOrder = [...context.chatDisplayOrder];

          // Remove the key if it already exists
          const existingIndex = newOrder.indexOf(projectChatKey);
          if (existingIndex > -1) {
            newOrder.splice(existingIndex, 1);
          }

          // Add to the beginning (newest first)
          newOrder.unshift(projectChatKey);
          return newOrder;
        },
      }),
    },

    CLOSE_PROJECT_CHAT: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const projectChatKey = getProjectChatKey(event.projectName);
          const projectInstance = newInstances.get(projectChatKey);
          if (projectInstance) {
            projectInstance.state.open = false;
            newInstances.set(projectChatKey, projectInstance);
          }
          return newInstances;
        },
        focusedResourceTarget: ({ context, event }) => {
          const projectChatKey = getProjectChatKey(event.projectName);
          return context.focusedResourceTarget === projectChatKey
            ? null
            : context.focusedResourceTarget;
        },
        chatDisplayOrder: ({ context, event }) => {
          const projectChatKey = getProjectChatKey(event.projectName);
          return context.chatDisplayOrder.filter(
            (key) => key !== projectChatKey
          );
        },
      }),
    },

    SET_CHAT_THREAD_ID: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          const instance = newInstances.get(resourceKey);
          if (instance) {
            instance.threadId = event.threadId;
            newInstances.set(resourceKey, instance);
          }
          return newInstances;
        },
      }),
    },

    SET_CHAT_THREADS: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          const instance = newInstances.get(resourceKey);
          if (instance) {
            instance.threads = event.threads;
            newInstances.set(resourceKey, instance);
          }
          return newInstances;
        },
      }),
    },

    SET_CHAT_STATE: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          const instance = newInstances.get(resourceKey);
          if (instance) {
            instance.state = { ...instance.state, ...event.state };
            newInstances.set(resourceKey, instance);
          }
          return newInstances;
        },
      }),
    },

    // Project chat state management
    SET_PROJECT_CHAT_THREAD_ID: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const projectChatKey = getProjectChatKey(event.projectName);
          const projectInstance = newInstances.get(projectChatKey);
          if (projectInstance) {
            projectInstance.threadId = event.threadId;
            newInstances.set(projectChatKey, projectInstance);
          }
          return newInstances;
        },
      }),
    },

    SET_PROJECT_CHAT_THREADS: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const projectChatKey = getProjectChatKey(event.projectName);
          const projectInstance = newInstances.get(projectChatKey);
          if (projectInstance) {
            projectInstance.threads = event.threads;
            newInstances.set(projectChatKey, projectInstance);
          }
          return newInstances;
        },
      }),
    },

    SET_PROJECT_CHAT_STATE: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const projectChatKey = getProjectChatKey(event.projectName);
          const projectInstance = newInstances.get(projectChatKey);
          if (projectInstance) {
            projectInstance.state = {
              ...projectInstance.state,
              ...event.state,
            };
            newInstances.set(projectChatKey, projectInstance);
          }
          return newInstances;
        },
      }),
    },

    // Pending message management
    ADD_PENDING_MESSAGE: {
      actions: assign({
        pendingMessages: ({ context, event }) => {
          const newPendingMessages = new Map(context.pendingMessages);
          const targetKey = serializeTargetKey(event.resourceTarget);
          const existingMessages = newPendingMessages.get(targetKey) || [];
          newPendingMessages.set(targetKey, [
            ...existingMessages,
            event.message,
          ]);
          return newPendingMessages;
        },
      }),
    },

    REMOVE_PENDING_MESSAGE: {
      actions: assign({
        pendingMessages: ({ context, event }) => {
          const newPendingMessages = new Map(context.pendingMessages);
          const targetKey = serializeTargetKey(event.resourceTarget);
          const existingMessages = newPendingMessages.get(targetKey) || [];
          const updatedMessages = existingMessages.filter(
            (_, index) => index !== event.messageIndex
          );

          if (updatedMessages.length === 0) {
            newPendingMessages.delete(targetKey);
          } else {
            newPendingMessages.set(targetKey, updatedMessages);
          }

          return newPendingMessages;
        },
      }),
    },

    CLEAR_PENDING_MESSAGES: {
      actions: assign({
        pendingMessages: ({ context, event }) => {
          const newPendingMessages = new Map(context.pendingMessages);
          const targetKey = serializeTargetKey(event.resourceTarget);
          newPendingMessages.delete(targetKey);
          return newPendingMessages;
        },
      }),
    },

    // Trigger pending message submission
    TRIGGER_PENDING_MESSAGES: {
      actions: assign({
        triggerPendingMessages: ({ context, event }) => {
          const newTriggers = new Map(context.triggerPendingMessages);
          const targetKey = serializeTargetKey(event.resourceTarget);
          newTriggers.set(targetKey, true);
          return newTriggers;
        },
      }),
    },

    CLEAR_TRIGGER_PENDING_MESSAGES: {
      actions: assign({
        triggerPendingMessages: ({ context, event }) => {
          const newTriggers = new Map(context.triggerPendingMessages);
          const targetKey = serializeTargetKey(event.resourceTarget);
          newTriggers.delete(targetKey);
          return newTriggers;
        },
      }),
    },
  },
});
