"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { Thread, type Message, type Interrupt } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import {
  ChatSectionState,
  serializeResourceTarget,
} from "@/contexts/chat/chat-machine";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useThreads } from "./thread-provider";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useEnv } from "./env-provider";
import AiChatboxLoading from "@/components/chat/components/chatbox-loading";
import { getProjectChatKey } from "@/contexts/chat/chat-machine";

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
  submit: (
    data: { messages: Message[]; stage?: string; command?: any },
    options?: { optimisticValues?: (prev: any) => any; command?: any }
  ) => any;
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
  resourceTarget?: ResourceTarget; // for resource chat
  projectName?: string; // for project chat
  children: ReactNode;
}

export function ChatInstanceProvider({
  resourceTarget,
  projectName,
  children,
}: ChatInstanceProviderProps) {
  const {
    getChatInstance,
    isResourceActive,
    focusedResourceTarget,
    getProjectChatInstance,
  } = useChatState();
  const {
    setChatThreadId,
    setChatThreads,
    setChatState,
    setProjectChatThreadId,
    setProjectChatThreads,
    setProjectChatState,
  } = useChatActions();
  const { getThreads, createNewThread } = useThreads();
  const { baseUrl, apiKey, modelName, contextWindowUsage, stage } =
    useLanggraphState();
  const { selectedProject, selectedProjectResources, selectedResourceContext } =
    useProjectState();
  const { auth } = useAuthState();
  const { LANGGRAPH_DEPLOYMENT_URL, LANGGRAPH_GRAPH_ID } = useEnv();

  // Determine if it's project chat or resource chat
  const isProjectChat = Boolean(projectName && !resourceTarget);
  const isResourceChat = Boolean(resourceTarget && !projectName);

  if (!isProjectChat && !isResourceChat) {
    throw new Error(
      "ChatInstanceProvider must have either resourceTarget or projectName, but not both"
    );
  }

  const chatInstance = isProjectChat
    ? getProjectChatInstance(projectName!)
    : getChatInstance(resourceTarget!);
  const isActive = isProjectChat
    ? true // project chat is always "active"
    : isResourceActive(resourceTarget!);
  const isFocused = isProjectChat
    ? focusedResourceTarget === getProjectChatKey(projectName!)
    : focusedResourceTarget === serializeResourceTarget(resourceTarget!);

  // Use useStream for this chat instance
  const streamValue = useStream({
    apiUrl: LANGGRAPH_DEPLOYMENT_URL,
    assistantId: LANGGRAPH_GRAPH_ID,
    threadId: chatInstance?.threadId || null,
    onThreadId: async (id: string) => {
      // Update the chat instance's threadId when a new one is created
      if (isProjectChat) {
        setProjectChatThreadId(projectName!, id);
      } else {
        setChatThreadId(resourceTarget!, id);
      }
    },
  });

  // Submit function that uses the chat instance's threadId and resourceTarget
  const submit = (
    data: {
      messages: Message[];
    },
    options?: any
  ) => {
    if (!baseUrl || !modelName) {
      console.warn("Missing required langgraph configuration");
      return;
    }

    return streamValue.submit(
      {
        // Default values
        api_key: apiKey,
        base_url: baseUrl,
        model_name: modelName,
        context_window_usage: contextWindowUsage,
        region_url: auth?.regionUrl,
        kubeconfig: auth?.kubeconfig,
        stage: stage,
        project_context: {
          selectedProject,
          selectedProjectResources,
        },
        resource_context: isResourceChat
          ? {
              selectedResource: resourceTarget!,
              selectedResourceContext,
            }
          : undefined,
        ...data,
      },
      {
        ...options,
      }
    );
  };

  // Fetch threads for this chat instance
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const threads = await getThreads(
          isProjectChat ? null : resourceTarget!
        );
        if (isProjectChat) {
          setProjectChatThreads(projectName!, threads);
        } else {
          setChatThreads(resourceTarget!, threads);
        }

        // Auto-select first thread if threads exist and no thread is currently selected
        if (threads.length > 0 && !chatInstance?.threadId) {
          const firstThread = threads[0];
          console.log("ChatInstanceProvider - Auto-selecting first thread:", {
            threadId: firstThread.thread_id,
            isProjectChat,
            resourceTarget: isResourceChat ? resourceTarget : null,
            projectName: isProjectChat ? projectName : null,
          });

          if (isProjectChat) {
            setProjectChatThreadId(projectName!, firstThread.thread_id);
          } else {
            setChatThreadId(resourceTarget!, firstThread.thread_id);
          }
        }
        // Create new thread if no threads exist
        else if (threads.length === 0 && !chatInstance?.threadId) {
          console.log(
            "ChatInstanceProvider - No threads found, creating new thread:",
            {
              isProjectChat,
              resourceTarget: isResourceChat ? resourceTarget : null,
              projectName: isProjectChat ? projectName : null,
            }
          );

          createNewThread.mutate(
            {
              metadata: {
                kubeconfig: auth?.kubeconfig,
                projectName: selectedProject,
                resourceTarget: isResourceChat ? resourceTarget : null,
              },
            },
            {
              onSuccess: (data: any) => {
                if (data?.thread_id) {
                  console.log("ChatInstanceProvider - New thread created:", {
                    threadId: data.thread_id,
                    isProjectChat,
                    resourceTarget: isResourceChat ? resourceTarget : null,
                    projectName: isProjectChat ? projectName : null,
                  });

                  if (isProjectChat) {
                    setProjectChatThreadId(projectName!, data.thread_id);
                  } else {
                    setChatThreadId(resourceTarget!, data.thread_id);
                  }
                }
              },
              onError: (error: any) => {
                console.error("Failed to create new thread:", error);
              },
            }
          );
        }
      } catch (error) {
        console.error("Failed to fetch threads for resource target:", error);
      }
    };

    if (isActive) {
      fetchThreads();
    }
  }, [resourceTarget, projectName, isActive, getThreads, isFocused]);

  // Default values if chat instance doesn't exist yet
  const defaultState: ChatSectionState = {
    open: false,
    responding: false,
    maximized: false,
    loading: false,
  };

  const value: ChatInstanceContextType = {
    ...streamValue,
    resourceTarget: isResourceChat ? resourceTarget! : null,
    threadId: chatInstance?.threadId || null,
    threads: chatInstance?.threads || [],
    state: chatInstance?.state || defaultState,
    isActive,
    isFocused,
    setChatThreadId: (threadId: string | null) =>
      isProjectChat
        ? setProjectChatThreadId(projectName!, threadId)
        : setChatThreadId(resourceTarget!, threadId),
    setChatThreads: (threads: Thread[]) =>
      isProjectChat
        ? setProjectChatThreads(projectName!, threads)
        : setChatThreads(resourceTarget!, threads),
    setChatState: (state: Partial<ChatSectionState>) =>
      isProjectChat
        ? setProjectChatState(projectName!, state)
        : setChatState(resourceTarget!, state),
    submit,
  };

  // Show loading chatbox when threadId is not available
  if (!chatInstance?.threadId) {
    return <AiChatboxLoading />;
  }

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
