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
}

export interface ChatContextState {
  chatInstances: Map<string, ChatInstance>; // Map<resourceTarget, ChatInstance>
  activeResourceTargets: string[];
  focusedResourceTarget: string | null;
  pendingMessages: Map<string, Message[]>; // Map<resourceTarget, Message[]> - stores pending messages for each target
}

export type ChatEvent =
  // Multi-instance chat management
  | { type: "OPEN_CHAT"; resourceTarget: ResourceTarget }
  | { type: "CLOSE_CHAT"; resourceTarget: ResourceTarget }

  // Project chat management
  | { type: "OPEN_PROJECT_CHAT" }
  | { type: "CLOSE_PROJECT_CHAT" }

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
      threadId: string | null;
    }
  | {
      type: "SET_PROJECT_CHAT_THREADS";
      threads: Thread[];
    }
  | {
      type: "SET_PROJECT_CHAT_STATE";
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
    };

// Helper function to serialize resource target to string key
export function serializeResourceTarget(
  resourceTarget: ResourceTarget
): string {
  return JSON.stringify(resourceTarget);
}

// Special key for project chat instance
export const PROJECT_CHAT_KEY = "__project__";

// Helper function to serialize resource target or null to string key
export function serializeTargetKey(
  resourceTarget: ResourceTarget | null
): string {
  return resourceTarget
    ? serializeResourceTarget(resourceTarget)
    : PROJECT_CHAT_KEY;
}

export const chatMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: ChatContextState; events: ChatEvent },
  id: "chat",
  initial: "idle",
  context: {
    chatInstances: new Map<string, ChatInstance>([
      // Create project chat instance by default
      [
        PROJECT_CHAT_KEY,
        {
          threadId: null,
          threads: [],
          state: {
            open: false,
            responding: false,
            maximized: false,
            loading: false,
          },
          // resourceTarget is undefined for project chat
        },
      ],
    ]),
    activeResourceTargets: [],
    focusedResourceTarget: null,
    pendingMessages: new Map<string, Message[]>(),
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
      }),
    },

    // Project chat management
    OPEN_PROJECT_CHAT: {
      actions: assign({
        chatInstances: ({ context }) => {
          const newInstances = new Map(context.chatInstances);
          const projectInstance = newInstances.get(PROJECT_CHAT_KEY);
          if (projectInstance) {
            projectInstance.state.open = true;
            newInstances.set(PROJECT_CHAT_KEY, projectInstance);
          }
          return newInstances;
        },
        focusedResourceTarget: () => PROJECT_CHAT_KEY,
      }),
    },

    CLOSE_PROJECT_CHAT: {
      actions: assign({
        chatInstances: ({ context }) => {
          const newInstances = new Map(context.chatInstances);
          const projectInstance = newInstances.get(PROJECT_CHAT_KEY);
          if (projectInstance) {
            projectInstance.state.open = false;
            newInstances.set(PROJECT_CHAT_KEY, projectInstance);
          }
          return newInstances;
        },
        focusedResourceTarget: ({ context }) => {
          return context.focusedResourceTarget === PROJECT_CHAT_KEY
            ? null
            : context.focusedResourceTarget;
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
          const projectInstance = newInstances.get(PROJECT_CHAT_KEY);
          if (projectInstance) {
            projectInstance.threadId = event.threadId;
            newInstances.set(PROJECT_CHAT_KEY, projectInstance);
          }
          return newInstances;
        },
      }),
    },

    SET_PROJECT_CHAT_THREADS: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const projectInstance = newInstances.get(PROJECT_CHAT_KEY);
          if (projectInstance) {
            projectInstance.threads = event.threads;
            newInstances.set(PROJECT_CHAT_KEY, projectInstance);
          }
          return newInstances;
        },
      }),
    },

    SET_PROJECT_CHAT_STATE: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const projectInstance = newInstances.get(PROJECT_CHAT_KEY);
          if (projectInstance) {
            projectInstance.state = {
              ...projectInstance.state,
              ...event.state,
            };
            newInstances.set(PROJECT_CHAT_KEY, projectInstance);
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
  },
});
