"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import { searchThreads } from "@/lib/langgraph/langgraph-api/langgraph-trpc-service";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useThreads } from "./thread-provider";
import { toast } from "sonner";

type StreamContextType = ReturnType<typeof useStream> & {
  submitWithContext: (data: { messages: Message[] }) => void;
};

const StreamContext = createContext<StreamContextType | undefined>(undefined);

async function sleep(ms = 2000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkGraphStatus(
  apiUrl: string,
  apiKey: string | null
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/info`, {
      ...(apiKey && {
        headers: {
          "X-Api-Key": apiKey,
        },
      }),
    });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const StreamSession = ({ children }: { children: ReactNode }) => {
  const { baseUrl, apiKey, modelName, contextWindowUsage, stage } =
    useLanggraphState();
  const { selectedThreadId } = useThreads();
  const {
    selectedProject,
    selectedProjectResources,
    selectedResource,
    selectedResourceContext,
  } = useProjectState();
  const { setThreads } = useThreads();
  const { auth } = useAuthState();

  const streamValue = useStream({
    apiUrl: process.env.NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL || "",
    assistantId: "orca",
    threadId: selectedThreadId || null,
    fetchStateHistory: true,
    onCustomEvent: (event, options) => {
      // UI message handling removed - no longer using uiMessageReducer
    },
    onThreadId: async (id) => {
      // Refetch threads list when thread ID changes using searchThreads with proper parameters
      if (auth?.kubeconfig) {
        try {
          await sleep();
          const searchParams: any = {
            kubeconfig: auth.kubeconfig,
          };

          if (selectedProject) {
            searchParams.projectName = selectedProject;
          }

          if (selectedResource) {
            searchParams.resourceTarget = selectedResource;
          }

          const threads = await searchThreads(searchParams);
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
      context: {
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
    });
  };

  useEffect(() => {
    if (baseUrl && apiKey) {
      checkGraphStatus(baseUrl, apiKey).then((ok) => {
        if (!ok) {
          toast.error("Failed to connect to LangGraph server", {
            description: `Please ensure your graph is running at ${baseUrl}`,
            duration: 5000,
          });
        }
      });
    }
  }, [apiKey, baseUrl]);

  const contextValue = {
    ...streamValue,
    submitWithContext,
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
