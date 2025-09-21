"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { Thread, type Message, type Interrupt } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useThreads } from "./thread-provider";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useEnv } from "./env-provider";

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

  // Submit function
  submit: (
    data: { stage?: string; command?: any },
    options?: { optimisticValues?: (prev: any) => any; command?: any }
  ) => any;
}

const HomeChatContext = createContext<HomeChatContextType | undefined>(
  undefined
);

export function HomeChatProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuthState();
  const { LANGGRAPH_DEPLOYMENT_URL, LANGGRAPH_GRAPH_ID } = useEnv();
  const { baseUrl, apiKey, modelName, stage } = useLanggraphState();
  const { createNewThread } = useThreads();
  const [threadId, setThreadId] = useState<string | null>(null);

  // Use useStream for home page chat
  const streamValue = useStream({
    apiUrl: LANGGRAPH_DEPLOYMENT_URL,
    assistantId: LANGGRAPH_GRAPH_ID,
    threadId: threadId, // Use the stored thread ID
    onThreadId: async (id: string) => {
      // Thread ID will be set automatically by useStream
      console.log("Home chat thread created:", id);
    },
  });

  // Submit function that uses the home page context
  const submit = (
    data: { stage?: string; command?: any },
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
        region_url: auth?.regionUrl,
        kubeconfig: auth?.kubeconfig,
        stage: "propose_project",
        ...data,
      },
      {
        ...options,
      }
    );
  };

  // Create a new thread when the component mounts
  useEffect(() => {
    const createHomeThread = async () => {
      if (!auth?.kubeconfig || threadId) return;

      try {
        console.log("Creating new thread for home page...");
        const thread = await createNewThread.mutateAsync({
          metadata: {
            kubeconfig: auth.kubeconfig,
            isHomePage: true, // Mark this as a home page thread
            graph_id: LANGGRAPH_GRAPH_ID, // Add the graph ID
          },
        });

        console.log("Home page thread created:", thread);
        // Store the thread ID in state
        setThreadId(thread.thread_id);
      } catch (error) {
        console.error("Failed to create home page thread:", error);
      }
    };

    createHomeThread();
  }, [auth?.kubeconfig]);

  const value: HomeChatContextType = {
    ...streamValue,
    api_key: apiKey,
    base_url: baseUrl,
    model_name: modelName,
    region_url: auth?.regionUrl,
    kubeconfig: auth?.kubeconfig,
    threadId,
    submit,
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
