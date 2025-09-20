"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { Thread, type Message, type Interrupt } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import {
  ChatSectionState,
  serializeResourceTarget,
  PROJECT_CHAT_KEY,
} from "@/contexts/chat/chat-machine";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useThreads } from "./thread-provider";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useEnv } from "./env-provider";

interface ChatInstanceContextType {
  resourceTarget: ResourceTarget | null; // null for project chat
  threadId: string | null;
  threads: Thread[];
  state: ChatSectionState;
  isActive: boolean;
  isFocused: boolean;
  setChatThreadId: (threadId: string | null) => void;
  setChatThreads: (threads: Thread[]) => void;
  setChatState: (state: Partial<ChatSectionState>) => void;
  submit: (data: { messages: Message[]; stage?: string; command?: any }) => any;
  // Stream properties from useStream
  isLoading: boolean;
  stop: () => void;
  messages: Message[];
  interrupt: Interrupt<unknown> | undefined;
}

const ChatInstanceContext = createContext<ChatInstanceContextType | undefined>(
  undefined
);

interface ChatInstanceProviderProps {
  resourceTarget: ResourceTarget | null; // null for project chat
  children: ReactNode;
}

export function ChatInstanceProvider({
  resourceTarget,
  children,
}: ChatInstanceProviderProps) {
  const { getChatInstance, isResourceActive, focusedResourceTarget, getProjectChatInstance } =
    useChatState();
  const { 
    setChatThreadId, 
    setChatThreads, 
    setChatState,
    setProjectChatThreadId,
    setProjectChatThreads,
    setProjectChatState 
  } = useChatActions();
  const { getThreads } = useThreads();
  const { baseUrl, apiKey, modelName, contextWindowUsage, stage } =
    useLanggraphState();
  const { selectedProject, selectedProjectResources, selectedResourceContext } =
    useProjectState();
  const { auth } = useAuthState();
  const { LANGGRAPH_DEPLOYMENT_URL, LANGGRAPH_GRAPH_ID } = useEnv();

  // Handle project chat vs resource chat
  const isProjectChat = resourceTarget === null;
  const chatInstance = isProjectChat 
    ? getProjectChatInstance() 
    : getChatInstance(resourceTarget);
  const isActive = isProjectChat 
    ? true // project chat is always "active"
    : isResourceActive(resourceTarget);
  const isFocused = isProjectChat
    ? focusedResourceTarget === PROJECT_CHAT_KEY
    : focusedResourceTarget === serializeResourceTarget(resourceTarget);

  // Log chat instance state changes
  useEffect(() => {
    // console.log("ChatInstanceProvider - State Change:", {
    //   resourceTarget,
    //   resourceTargetKey: serializeResourceTarget(resourceTarget),
    //   isActive,
    //   isFocused,
    //   hasChatInstance: !!chatInstance,
    //   threadId: chatInstance?.threadId,
    //   threadCount: chatInstance?.threads?.length || 0,
    //   state: chatInstance?.state,
    //   globalFocusedTarget: focusedResourceTarget
    // });
  }, [
    resourceTarget,
    isActive,
    isFocused,
    chatInstance,
    focusedResourceTarget,
  ]);

  // Use useStream for this chat instance
  const streamValue = useStream({
    apiUrl: LANGGRAPH_DEPLOYMENT_URL,
    assistantId: LANGGRAPH_GRAPH_ID,
    threadId: chatInstance?.threadId || null,
    onThreadId: async (id: string) => {
      // Update the chat instance's threadId when a new one is created
      if (isProjectChat) {
        setProjectChatThreadId(id);
      } else {
        setChatThreadId(resourceTarget, id);
      }
    },
  });

  // Submit function that uses the chat instance's threadId and resourceTarget
  const submit = (data: {
    messages: Message[];
    stage?: string;
    command?: any;
  }) => {
    const { stage: customStage, messages, command } = data;
    const finalStage = customStage || stage;

    if (!baseUrl || !modelName || !finalStage) {
      console.warn("Missing required langgraph configuration");
      return;
    }

    return streamValue.submit(
      {
        messages,
        api_key: apiKey,
        base_url: baseUrl,
        model_name: modelName,
        context_window_usage: contextWindowUsage,
        region_url: auth?.regionUrl,
        kubeconfig: auth?.kubeconfig,
        stage: finalStage,
        project_context: {
          selectedProject,
          selectedProjectResources,
        },
        resource_context: resourceTarget
          ? {
              selectedResource: resourceTarget,
              selectedResourceContext,
            }
          : undefined,
      },
      {
        command,
      }
    );
  };

  // Fetch threads for this resource target
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const threads = await getThreads(resourceTarget); // resourceTarget is null for project chat
        if (isProjectChat) {
          setProjectChatThreads(threads);
        } else {
          setChatThreads(resourceTarget, threads);
        }

        // Log active target and threads for debugging
        console.log("ChatInstanceProvider - Active Target:", {
          resourceTarget,
          resourceTargetKey: resourceTarget ? serializeResourceTarget(resourceTarget) : PROJECT_CHAT_KEY,
          isProjectChat,
          isActive,
          isFocused,
          threadCount: threads.length,
          threads: threads.map((t) => ({
            id: t.thread_id,
            updated_at: t.updated_at,
            metadata: t.metadata,
          })),
        });
      } catch (error) {
        console.error("Failed to fetch threads for resource target:", error);
      }
    };

    if (isActive) {
      fetchThreads();
    }
  }, [resourceTarget, isActive, getThreads, isFocused]);

  // Default values if chat instance doesn't exist yet
  const defaultState: ChatSectionState = {
    open: false,
    responding: false,
    maximized: false,
    loading: false,
  };

  const value: ChatInstanceContextType = {
    ...streamValue,
    resourceTarget,
    threadId: chatInstance?.threadId || null,
    threads: chatInstance?.threads || [],
    state: chatInstance?.state || defaultState,
    isActive,
    isFocused,
    setChatThreadId: (threadId: string | null) =>
      isProjectChat 
        ? setProjectChatThreadId(threadId)
        : setChatThreadId(resourceTarget, threadId),
    setChatThreads: (threads: Thread[]) =>
      isProjectChat
        ? setProjectChatThreads(threads)
        : setChatThreads(resourceTarget, threads),
    setChatState: (state: Partial<ChatSectionState>) =>
      isProjectChat
        ? setProjectChatState(state)
        : setChatState(resourceTarget, state),
    submit,
  };

  return (
    <ChatInstanceContext.Provider value={value}>
      {children}
    </ChatInstanceContext.Provider>
  );
}

export function useChatInstance(): ChatInstanceContextType {
  const context = useContext(ChatInstanceContext);
  if (context === undefined) {
    throw new Error(
      "useChatInstance must be used within a ChatInstanceProvider"
    );
  }
  return context;
}
