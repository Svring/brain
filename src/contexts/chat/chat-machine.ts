"use client";

import { assign, createMachine } from "xstate";
import { Thread, Message } from "@langchain/langgraph-sdk";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export interface ChatSectionState {
  open: boolean;
  responding: boolean;
  maximized: boolean;
  loading: boolean;
  zIndex: number; 
}

export interface ChatInstance {
  threadId: string | null;
  threads: Thread[];
  state: ChatSectionState;
  resourceTarget?: ResourceTarget;
  projectName?: string;
}

export interface ChatContextState {
  chatInstances: Map<string, ChatInstance>;
  activeResourceTargets: string[];
  focusedResourceTarget: string | null;
  pendingMessages: Map<string, Message[]>;
  chatDisplayOrder: string[];
  triggerPendingMessages: Map<string, boolean>;
  stackedChats: string[]; 
  activeChatIndex: number; 
  topLayerType: 'resource' | 'project'; 
}

export type ChatEvent =
  | { type: "OPEN_CHAT"; resourceTarget: ResourceTarget }
  | { type: "CLOSE_CHAT"; resourceTarget: ResourceTarget }
  | { type: "OPEN_PROJECT_CHAT"; projectName: string }
  | { type: "CLOSE_PROJECT_CHAT"; projectName: string }
  | { type: "FOCUS_CHAT"; chatKey: string }
  | { type: "STACK_CHAT"; chatKey: string }
  | { type: "UNSTACK_CHAT"; chatKey: string }
  | { type: "SWITCH_TO_NEXT_CHAT" }
  | { type: "SWITCH_TO_PREV_CHAT" }
  | { type: "SET_TOP_LAYER_TYPE"; layerType: 'resource' | 'project' }
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
  | {
      type: "ADD_PENDING_MESSAGE";
      resourceTarget: ResourceTarget | null;
      message: Message;
    }
  | {
      type: "REMOVE_PENDING_MESSAGE";
      resourceTarget: ResourceTarget | null;
      messageIndex: number;
    }
  | {
      type: "CLEAR_PENDING_MESSAGES";
      resourceTarget: ResourceTarget | null;
    }
  | {
      type: "TRIGGER_PENDING_MESSAGES";
      resourceTarget: ResourceTarget | null;
    }
  | {
      type: "CLEAR_TRIGGER_PENDING_MESSAGES";
      resourceTarget: ResourceTarget | null;
    };

export function serializeResourceTarget(
  resourceTarget: ResourceTarget
): string {
  return JSON.stringify(resourceTarget);
}

export function getProjectChatKey(projectName: string): string {
  return `__project__${projectName}`;
}

export function serializeTargetKey(
  resourceTarget: ResourceTarget | null,
  projectName?: string
): string {
  if (resourceTarget) {
    return serializeResourceTarget(resourceTarget);
  }
  if (projectName) {
    return getProjectChatKey(projectName);
  }
  return "__project__";
}

function calculateZIndex(stackedChats: string[], chatKey: string): number {
  const baseZIndex = 10;
  const index = stackedChats.indexOf(chatKey);
  return index >= 0 ? baseZIndex + index : baseZIndex;
}

export const chatMachine = createMachine({
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
    stackedChats: [], 
    activeChatIndex: 0, 
    topLayerType: 'resource', 
  },
  states: {
    idle: {},
  },
  on: {
    OPEN_CHAT: {
      actions: [
        assign({
          chatInstances: ({ context, event }) => {
            const newInstances = new Map(context.chatInstances);
            const resourceKey = serializeResourceTarget(event.resourceTarget);

            if (newInstances.has(resourceKey)) {
              return newInstances;
            }

            const filteredTargets = context.activeResourceTargets.filter(
              (target) => target.startsWith("__project__")
            );

            const newInstance: ChatInstance = {
              threadId: null,
              threads: [],
              state: {
                open: true,
                responding: false,
                maximized: false,
                loading: false,
                zIndex: calculateZIndex([...context.stackedChats, resourceKey], resourceKey) + 10,
              },
              resourceTarget: event.resourceTarget,
            };

            newInstances.set(resourceKey, newInstance);
            return newInstances;
          },
          activeResourceTargets: ({ context, event }) => {
            const resourceKey = serializeResourceTarget(event.resourceTarget);
            const filteredTargets = context.activeResourceTargets.filter(
              (target) => target.startsWith("__project__")
            );
            return [...filteredTargets, resourceKey];
          },
          focusedResourceTarget: ({ event }) => {
            return serializeResourceTarget(event.resourceTarget);
          },
          chatDisplayOrder: ({ context, event }) => {
            const resourceKey = serializeResourceTarget(event.resourceTarget);
            const newOrder = [...context.chatDisplayOrder];
            const existingIndex = newOrder.indexOf(resourceKey);
            if (existingIndex > -1) {
              newOrder.splice(existingIndex, 1);
            }
            newOrder.unshift(resourceKey);
            return newOrder;
          },
          stackedChats: ({ context, event }) => {
            const resourceKey = serializeResourceTarget(event.resourceTarget);
            const filteredStacked = context.stackedChats.filter(
              (key) => key.startsWith("__project__")
            );
            return [...filteredStacked, resourceKey];
          },
          activeChatIndex: ({ context, event }) => {
            const resourceKey = serializeResourceTarget(event.resourceTarget);
            const filteredStacked = context.stackedChats.filter(
              (key) => key.startsWith("__project__")
            );
            const newStackedChats = [...filteredStacked, resourceKey];
            return Math.max(0, newStackedChats.length - 1);
          },
        }),
        ({ context, event }) => {
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          const oldResourceChats: string[] = [];
          
          for (const [key, instance] of context.chatInstances.entries()) {
            if (!key.startsWith("__project__") && 
                instance.resourceTarget && 
                key !== resourceKey) {
              oldResourceChats.push(key);
            }
          }
          
          oldResourceChats.forEach((key) => {
            context.chatInstances.delete(key);
          });
          
          if (oldResourceChats.length > 0) {
            // Cleaned up old resource chat instances
          }
        },
      ],
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
          if (context.focusedResourceTarget === resourceKey) {
            const remainingStackedChats = context.stackedChats.filter(key => key !== resourceKey);
            if (remainingStackedChats.length > 0) {
              return remainingStackedChats[0];
            }
            return null;
          }
          return context.focusedResourceTarget;
        },
        chatDisplayOrder: ({ context, event }) => {
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          return context.chatDisplayOrder.filter((key) => key !== resourceKey);
        },
        stackedChats: ({ context, event }) => {
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          return context.stackedChats.filter(key => key !== resourceKey);
        },
        activeChatIndex: ({ context, event }) => {
          const resourceKey = serializeResourceTarget(event.resourceTarget);
          const newStackedChats = context.stackedChats.filter(key => key !== resourceKey);
          const currentIndex = context.activeChatIndex;
          return Math.min(currentIndex, Math.max(0, newStackedChats.length - 1));
        },
      }),
    },

    OPEN_PROJECT_CHAT: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const projectChatKey = getProjectChatKey(event.projectName);

          let projectInstance = newInstances.get(projectChatKey);
          if (!projectInstance) {
            projectInstance = {
              threadId: null,
              threads: [],
              state: {
                open: true,
                responding: false,
                maximized: false,
                loading: false,
                zIndex: calculateZIndex([...context.stackedChats, projectChatKey], projectChatKey),
              },
              projectName: event.projectName,
            };
          } else {
            projectInstance.state.open = true;
            projectInstance.state.zIndex = calculateZIndex([...context.stackedChats, projectChatKey], projectChatKey);
          }

          newInstances.set(projectChatKey, projectInstance);
          return newInstances;
        },
        focusedResourceTarget: ({ event }) =>
          getProjectChatKey(event.projectName),
        chatDisplayOrder: ({ context, event }) => {
          const projectChatKey = getProjectChatKey(event.projectName);
          const newOrder = [...context.chatDisplayOrder];
          const existingIndex = newOrder.indexOf(projectChatKey);
          if (existingIndex > -1) {
            newOrder.splice(existingIndex, 1);
          }
          newOrder.unshift(projectChatKey);
          return newOrder;
        },
        stackedChats: ({ context, event }) => {
          const projectChatKey = getProjectChatKey(event.projectName);
          if (!context.stackedChats.includes(projectChatKey)) {
            return [...context.stackedChats, projectChatKey];
          }
          return context.stackedChats;
        },
        activeChatIndex: ({ context, event }) => {
          const projectChatKey = getProjectChatKey(event.projectName);
          const newStackedChats = context.stackedChats.includes(projectChatKey) 
            ? context.stackedChats 
            : [...context.stackedChats, projectChatKey];
          return Math.max(0, newStackedChats.length - 1);
        },
      }),
    },

    CLOSE_PROJECT_CHAT: {
      actions: assign({
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const projectChatKey = getProjectChatKey(event.projectName);
          newInstances.delete(projectChatKey);
          return newInstances;
        },
        focusedResourceTarget: ({ context, event }) => {
          const projectChatKey = getProjectChatKey(event.projectName);
          if (context.focusedResourceTarget === projectChatKey) {
            const remainingStackedChats = context.stackedChats.filter(key => key !== projectChatKey);
            if (remainingStackedChats.length > 0) {
              return remainingStackedChats[0];
            }
            return null;
          }
          return context.focusedResourceTarget;
        },
        chatDisplayOrder: ({ context, event }) => {
          const projectChatKey = getProjectChatKey(event.projectName);
          return context.chatDisplayOrder.filter(
            (key) => key !== projectChatKey
          );
        },
        stackedChats: ({ context, event }) => {
          const projectChatKey = getProjectChatKey(event.projectName);
          return context.stackedChats.filter(key => key !== projectChatKey);
        },
        activeChatIndex: ({ context, event }) => {
          const projectChatKey = getProjectChatKey(event.projectName);
          const newStackedChats = context.stackedChats.filter(key => key !== projectChatKey);
          const currentIndex = context.activeChatIndex;
          return Math.min(currentIndex, Math.max(0, newStackedChats.length - 1));
        },
      }),
    },

    SET_TOP_LAYER_TYPE: {
      actions: assign({
        topLayerType: ({ event }) => event.layerType,
      }),
    },

    FOCUS_CHAT: {
      actions: assign({
        activeChatIndex: ({ context, event }) => {
          const chatIndex = context.stackedChats.indexOf(event.chatKey);
          return chatIndex >= 0 ? chatIndex : context.activeChatIndex;
        },
        focusedResourceTarget: ({ event }) => event.chatKey,
        chatInstances: ({ context, event }) => {
          const newInstances = new Map(context.chatInstances);
          const targetIndex = context.stackedChats.indexOf(event.chatKey);
          
          if (targetIndex >= 0) {
            const reorderedChats = [...context.stackedChats];
            const [targetChat] = reorderedChats.splice(targetIndex, 1);
            reorderedChats.push(targetChat);
            
            reorderedChats.forEach((chatKey, index) => {
              const instance = newInstances.get(chatKey);
              if (instance) {
                instance.state.zIndex = 10 + index;
                newInstances.set(chatKey, instance);
              }
            });
          }
          
          return newInstances;
        },
        stackedChats: ({ context, event }) => {
          const targetIndex = context.stackedChats.indexOf(event.chatKey);
          if (targetIndex >= 0 && targetIndex < context.stackedChats.length - 1) {
            const reorderedChats = [...context.stackedChats];
            const [targetChat] = reorderedChats.splice(targetIndex, 1);
            reorderedChats.push(targetChat);
            return reorderedChats;
          }
          return context.stackedChats;
        },
      }),
    },

    SWITCH_TO_NEXT_CHAT: {
      actions: assign({
        activeChatIndex: ({ context }) => {
          const nextIndex = (context.activeChatIndex + 1) % Math.max(1, context.stackedChats.length);
          return nextIndex;
        },
        focusedResourceTarget: ({ context }) => {
          const nextIndex = (context.activeChatIndex + 1) % Math.max(1, context.stackedChats.length);
          return context.stackedChats[nextIndex] || null;
        },
      }),
    },

    SWITCH_TO_PREV_CHAT: {
      actions: assign({
        activeChatIndex: ({ context }) => {
          const prevIndex = context.activeChatIndex <= 0 
            ? Math.max(0, context.stackedChats.length - 1)
            : context.activeChatIndex - 1;
          return prevIndex;
        },
        focusedResourceTarget: ({ context }) => {
          const prevIndex = context.activeChatIndex <= 0 
            ? Math.max(0, context.stackedChats.length - 1)
            : context.activeChatIndex - 1;
          return context.stackedChats[prevIndex] || null;
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