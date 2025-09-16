"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import { searchThreads } from "@/lib/langgraph/langgraph-api/langgraph-trpc-service";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useThreads } from "./thread-provider";
import { useEnv } from "./env-provider";
import { toast } from "sonner";
import { useMount } from "@reactuses/core";
import { useCreateThreadRunStreamMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { Client } from "@langchain/langgraph-sdk";

type StreamContextType = ReturnType<typeof useStream> & {
  submitWithContext: (data: { messages: Message[] }) => void;
  streamThread: (messages: Message[]) => Promise<any>;
  messages: Message[];
};

const StreamContext = createContext<StreamContextType | undefined>(undefined);

async function sleep(ms = 2000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkGraphStatus(apiUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/info`);
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const StreamSession = ({ children }: { children: ReactNode }) => {
  const { baseUrl, apiKey, modelName, contextWindowUsage, stage } =
    useLanggraphState();
  const { selectedThreadId, getThreads, setThreads, messages } = useThreads();
  const {
    selectedProject,
    selectedProjectResources,
    selectedResource,
    selectedResourceContext,
  } = useProjectState();
  const { auth } = useAuthState();
  const { LANGGRAPH_DEPLOYMENT_URL } = useEnv();

  // Create thread run stream mutation
  const createThreadRunStreamMutation = useCreateThreadRunStreamMutation();

  const streamValue = useStream({
    apiUrl: LANGGRAPH_DEPLOYMENT_URL,
    assistantId: "orca",
    threadId: selectedThreadId || null,
    // fetchStateHistory: true,
    onThreadId: async (id) => {
      // Refetch threads list when thread ID changes using searchThreads with proper parameters
      if (auth?.kubeconfig) {
        try {
          await sleep();
          const threads = await getThreads();
          setThreads(threads);
        } catch (error) {
          console.error("Failed to refetch threads:", error);
        }
      }
    },
  });

  // Create a wrapper that automatically includes BrainState context
  const submitWithContext = (data: { messages: Message[] }) => {
    if (!baseUrl || !modelName || !stage) {
      console.warn("Missing required langgraph configuration");
      return;
    }

    return streamValue.submit({
      ...data,
      api_key: apiKey,
      base_url: baseUrl,
      model_name: modelName,
      context_window_usage: contextWindowUsage,
      stage,
      project_context: {
        selectedProject,
        selectedProjectResources,
      },
      resource_context: selectedResource
        ? {
            selectedResource,
            selectedResourceContext,
          }
        : undefined,
    });
  };

  // Stream thread function that uses the mutation
  const streamThread = async (messages: Message[]) => {
    if (!selectedThreadId) {
      console.warn("No thread selected for streaming");
      return;
    }

    if (!baseUrl || !modelName || !stage) {
      console.warn("Missing required langgraph configuration");
      return;
    }

    const payload = {
      input: {
        messages: messages,
        api_key: apiKey,
        base_url: baseUrl,
        model_name: modelName,
        context_window_usage: contextWindowUsage,
        stage,
        project_context: {
          selectedProject,
          selectedProjectResources,
        },
        resource_context: selectedResource
          ? {
              selectedResource,
              selectedResourceContext,
            }
          : undefined,
      },
    };

    // Create a client-side client and call the stream method directly
    const client = new Client({
      apiUrl: LANGGRAPH_DEPLOYMENT_URL,
    });

    const stream = client.runs.stream(selectedThreadId, "orca", {
      ...payload,
      streamMode: "messages",
    });

    return stream;
  };

  useMount(() => {
    checkGraphStatus(LANGGRAPH_DEPLOYMENT_URL).then((ok) => {
      if (!ok) {
        toast.error("Failed to connect to LangGraph server", {
          description: `Please ensure your graph is running at ${LANGGRAPH_DEPLOYMENT_URL}`,
          duration: 5000,
        });
      }
    });
  });

  const contextValue = {
    ...streamValue,
    submitWithContext,
    streamThread,
    // messages,
  };


  return (
    <StreamContext.Provider value={contextValue}>
      {children}
    </StreamContext.Provider>
  );
};

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <StreamSession>{children}</StreamSession>;
};

export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};
