"use client";

import type { Interrupt, Message } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useQueryState } from "nuqs";
import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
} from "react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { langgraphAuthFields } from "@/lib/langgraph/langgraph-run-input";
import { useEnv } from "./env-provider";
import { useThreads } from "./thread-provider";

interface HomeChatContextType {
  // Stream-related properties from useStream
  isLoading: boolean;
  stop: () => void;
  interrupt: Interrupt | undefined;
  messages: Message[];

  // Configuration properties
  api_key: string | undefined;
  base_url: string | undefined;
  model_name: string | undefined;
  region_url: string | undefined;
  kubeconfig: string | undefined;

  // Thread information
  threadId: string | null;

  // Session information
  sessionId: string | null;

  // Trial information
  trial: string | null;

  // Submit function
  submit: (
    data: { stage?: string; command?: any },
    options?: { optimisticValues?: (prev: any) => any; command?: any }
  ) => any;

  // Create new chat function
  createNewChat: () => void;
  isCreatingNewChat: boolean;
}

const HomeChatContext = createContext<HomeChatContextType | undefined>(
  undefined
);

interface HomeChatProviderProps {
  children: ReactNode;
  sessionId?: string | null;
  trial?: string | null;
}

export function HomeChatProvider({
  children,
  sessionId,
  trial,
}: HomeChatProviderProps) {
  const { auth } = useAuthState();
  const { LANGGRAPH_DEPLOYMENT_URL, LANGGRAPH_GRAPH_ID } = useEnv();
  const { baseUrl, apiKey, modelName } = useLanggraphState();
  const { createNewThread } = useThreads();
  const [threadId, setThreadId] = useQueryState("threadId");

  // Use useStream for home page chat
  const streamValue = useStream({
    apiUrl: LANGGRAPH_DEPLOYMENT_URL,
    assistantId: LANGGRAPH_GRAPH_ID,
    threadId: threadId, // Use the stored thread ID
    onThreadId: async (id: string) => {
      // Thread ID will be set automatically by useStream
    },
    defaultHeaders: {
      authorization: auth?.kubeconfig,
    },
  });

  // Submit function that uses the home page context
  const submit = (
    data: { stage?: string; command?: any; newMessages?: Message[] },
    options?: { optimisticValues?: (prev: any) => any; command?: any }
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
        ...langgraphAuthFields(auth),
        stage: "propose_project",
        messages: data.newMessages,
        ...data,
      },
      {
        ...options,
      }
    );
  };

  // Create new chat function
  const createNewChat = () => {
    if (!auth?.kubeconfig) {
      console.warn("Cannot create new chat: missing kubeconfig");
      return;
    }

    createNewThread.mutate(
      {
        metadata: {
          sessionId,
          graph_id: LANGGRAPH_GRAPH_ID, // Add the graph ID
        },
      },
      {
        onSuccess: (data: any) => {
          if (data?.thread_id) {
            setThreadId(data.thread_id);
          }
        },
        onError: (error: any) => {
          console.error("Failed to create new home chat thread:", error);
        },
      }
    );
  };

  // Create a new thread when the component mounts
  useEffect(() => {
    const createHomeThread = async () => {
      if (!auth?.kubeconfig || threadId) return;

      try {
        const thread = await createNewThread.mutateAsync({
          metadata: {
            sessionId,
            graph_id: LANGGRAPH_GRAPH_ID, // Add the graph ID
          },
        });

        // Store the thread ID in state
        setThreadId(thread.thread_id);
      } catch (error) {
        console.error("Failed to create home page thread:", error);
      }
    };

    createHomeThread();
  }, [threadId]);

  const value: HomeChatContextType = {
    // Only spread the properties we need from streamValue
    isLoading: streamValue.isLoading,
    stop: streamValue.stop,
    interrupt: streamValue.interrupt,
    messages: streamValue.messages,
    api_key: apiKey,
    base_url: baseUrl,
    model_name: modelName,
    region_url: auth?.regionUrl,
    kubeconfig: auth?.kubeconfig,
    threadId,
    sessionId: sessionId ?? null,
    trial: trial ?? null,
    submit,
    createNewChat,
    isCreatingNewChat: createNewThread.isPending,
  };

  return (
    <HomeChatContext.Provider value={value}>
      {children}
    </HomeChatContext.Provider>
  );
}

export function useHomeChat() {
  const context = useContext(HomeChatContext);
  if (context === undefined) {
    throw new Error("useHomeChat must be used within a HomeChatProvider");
  }
  return context;
}
