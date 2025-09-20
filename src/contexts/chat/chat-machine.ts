"use client";

import { assign, createMachine } from "xstate";
import { Thread } from "@langchain/langgraph-sdk";
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
  resourceTarget?: ResourceTarget;
}

export interface ChatContextState {
  chatInstances: Map<string, ChatInstance>; // Map<resourceTarget, ChatInstance>
  activeResourceTargets: string[];
  focusedResourceTarget: string | null;
}

export type ChatEvent =
  // Multi-instance chat management
  | { type: "OPEN_CHAT"; resourceTarget: ResourceTarget }
  | { type: "CLOSE_CHAT"; resourceTarget: ResourceTarget }

  // Per-instance state management
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
    };

// Helper function to serialize resource target to string key
export function serializeResourceTarget(
  resourceTarget: ResourceTarget
): string {
  return JSON.stringify(resourceTarget);
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
  },
});
