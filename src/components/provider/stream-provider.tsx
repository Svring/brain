"use client";

import { Client, type Message } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useMount } from "@reactuses/core";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useLanggraphState } from "@/contexts/langgraph/langgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { getThreadState } from "@/lib/langgraph/langgraph-api/langgraph-api-service";
import { useEnv } from "./env-provider";
import { useThreads } from "./thread-provider";

type StreamContextType = ReturnType<typeof useStream> & {
  submitWithContext: (data: {
    messages: Message[];
    stage?: string;
    command?: any;
  }) => void;
  createThreadRun: (threadId: string, messages: Message[]) => Promise<any>;
  sendMessage: (messages: Message[]) => Promise<void>;
  messages: Message[];
};

const StreamContext = createContext<StreamContextType | undefined>(undefined);

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
  const {
    selectedThreadId,
    getThreads,
    setThreads,
    messages,
    setMessages,
    isStreaming,
    setIsStreaming,
  } = useThreads();
  const {
    selectedProject,
    selectedProjectResources,
    selectedResource,
    selectedResourceContext,
  } = useProjectState();
  const { auth } = useAuthState();
  const { LANGGRAPH_DEPLOYMENT_URL, LANGGRAPH_GRAPH_ID } = useEnv();
  const queryClient = useQueryClient();

  // console.log("selectedThreadId", selectedThreadId);

  const streamValue = useStream({
    apiUrl: LANGGRAPH_DEPLOYMENT_URL,
    assistantId: LANGGRAPH_GRAPH_ID,
    threadId: selectedThreadId || null,
    onThreadId: async (id) => {},
    defaultHeaders: {
      authorization: auth?.kubeconfig,
    },
  });

  // Create a wrapper that automatically includes BrainState context
  const submitWithContext = (data: {
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

    // console.log("submitWithContext", data);

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
        resource_context: selectedResource
          ? {
              selectedResource,
              selectedResourceContext,
            }
          : undefined,
      },
      {
        command,
      }
    );
  };

  // Stream thread function that uses the mutation
  const createThreadRun = async (threadId: string, messages: Message[]) => {
    const payload = {
      input: {
        messages: messages,
        api_key: apiKey,
        base_url: baseUrl,
        model_name: modelName,
        context_window_usage: contextWindowUsage,
        region_url: auth?.regionUrl,
        kubeconfig: auth?.kubeconfig,
        stage,
      },
    };

    // Create a client-side client and call the stream method directly
    const client = new Client({
      apiUrl: LANGGRAPH_DEPLOYMENT_URL,
      defaultHeaders: {
        authorization: auth?.kubeconfig,
      },
    });

    const run = await client.runs.create(threadId, LANGGRAPH_GRAPH_ID, {
      ...payload,
      metadata: {
        kubeconfig: auth?.kubeconfig,
        projectName: selectedProject,
        resourceTarget: selectedResource,
      },
      streamResumable: true,
    });

    return run;
  };

  // Send message function that handles the entire flow
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
        region_url: auth?.regionUrl,
        kubeconfig: auth?.kubeconfig,
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
      defaultHeaders: {
        authorization: auth?.kubeconfig,
      },
    });
    const stream = client.runs.stream(selectedThreadId, LANGGRAPH_GRAPH_ID, {
      ...payload,
      streamMode: "updates",
    });
    return stream;
  };

  // Send message function that handles the entire flow

  const sendMessage = async (messagesToSend: Message[]) => {
    if (messagesToSend.length > 0 && !isStreaming) {
      setIsStreaming(true);
      const updatedMessages = [...messages, ...messagesToSend];
      setMessages(updatedMessages);
      const stream = await streamThread(messagesToSend);
      if (!stream) {
        setIsStreaming(false);
        return;
      }
      try {
        for await (const event of stream) {
          console.log("event", event);
          if (event.event === "updates" && event.data) {
            const streamData = event.data;
            const newMessages: Message[] = [];
            for (const [nodeName, nodeData] of Object.entries(streamData)) {
              if (nodeData && typeof nodeData === "object") {
                if ("messages" in nodeData) {
                  const nodeMessages = nodeData.messages;
                  if (
                    nodeMessages &&
                    typeof nodeMessages === "object" &&
                    !Array.isArray(nodeMessages)
                  ) {
                    const messageData = nodeMessages as any;
                    const message: Message = {
                      id: messageData.id || uuidv4(),
                      type: messageData.type || "ai",
                      content: messageData.content || "",
                      ...messageData,
                    };
                    newMessages.push(message);
                  } else if (Array.isArray(nodeMessages)) {
                    nodeMessages.forEach((msg: any) => {
                      if (msg && typeof msg === "object") {
                        const message: Message = {
                          id: msg.id || uuidv4(),
                          type: msg.type || "tool",
                          content: msg.content || "",
                          ...msg,
                        };
                        newMessages.push(message);
                      }
                    });
                  }
                }
              }
            }
            if (newMessages.length > 0) {
              setMessages((prevMessages) => {
                const existingIds = new Set(prevMessages.map((m) => m.id));
                const uniqueNewMessages = newMessages.filter(
                  (m) => !existingIds.has(m.id)
                );
                return [...prevMessages, ...uniqueNewMessages];
              });
            }
          }
        }
      } finally {
        setIsStreaming(false);
        if (selectedThreadId) {
          try {
            const threadState = await getThreadState(
              selectedThreadId,
              auth?.kubeconfig
            );
            const threadMessages = (threadState.values as any)?.messages;
            if (Array.isArray(threadMessages)) {
              setMessages(threadMessages);
            }
          } catch (error) {
            console.error("Failed to fetch thread state:", error);
          }
          queryClient.invalidateQueries({
            queryKey: ["threadState", selectedThreadId],
          });
        }
      }
    }
  };

  // useMount(() => {
  //   checkGraphStatus(LANGGRAPH_DEPLOYMENT_URL).then((ok) => {
  //     if (!ok) {
  //       toast.error("Failed to connect to LangGraph server", {
  //         description: `Please ensure your graph is running at ${LANGGRAPH_DEPLOYMENT_URL}`,
  //         duration: 5000,
  //       });
  //     }
  //   });
  // });

  const contextValue = {
    ...streamValue,
    submitWithContext,
    createThreadRun,
    sendMessage,
    messages,
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
