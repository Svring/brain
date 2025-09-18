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
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";
import { getThreadState } from "@/lib/langgraph/langgraph-api/langgraph-api-service";

type StreamContextType = ReturnType<typeof useStream> & {
  submitWithContext: (data: {
    messages: Message[];
    stage?: string;
    command?: any;
  }) => void;
  streamThread: (messages: Message[]) => Promise<any>;
  sendMessage: (messages: Message[]) => Promise<void>;
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

  const streamValue = useStream({
    apiUrl: LANGGRAPH_DEPLOYMENT_URL,
    assistantId: LANGGRAPH_GRAPH_ID,
    threadId: selectedThreadId || null,
    // fetchStateHistory: true,
    onThreadId: async (id) => {
      // Refetch threads list when thread ID changes using searchThreads with proper parameters
      if (auth?.kubeconfig) {
        try {
          await sleep();
          const threads = await getThreads(selectedProject, selectedResource);
          setThreads(threads);
        } catch (error) {
          console.error("Failed to refetch threads:", error);
        }
      }
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
      command ? { command } : undefined
    );
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
      // Set streaming state to true
      setIsStreaming(true);

      // Add the messages to the messages list immediately
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

          // Handle the new "updates" event format
          if (event.event === "updates" && event.data) {
            const streamData = event.data;

            // Extract messages from all nodes in the stream data
            const newMessages: Message[] = [];

            // Iterate through all nodes in the data
            for (const [nodeName, nodeData] of Object.entries(streamData)) {
              if (nodeData && typeof nodeData === "object") {
                // Check if this node has messages
                if ("messages" in nodeData) {
                  const nodeMessages = nodeData.messages;

                  // Handle single message object
                  if (
                    nodeMessages &&
                    typeof nodeMessages === "object" &&
                    !Array.isArray(nodeMessages)
                  ) {
                    // Add required fields if missing
                    const messageData = nodeMessages as any;
                    const message: Message = {
                      id: messageData.id || uuidv4(),
                      type: messageData.type || "ai",
                      content: messageData.content || "",
                      ...messageData,
                    };
                    newMessages.push(message);
                  }
                  // Handle array of messages
                  else if (Array.isArray(nodeMessages)) {
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

            // Update messages with new messages from stream
            if (newMessages.length > 0) {
              console.log("Adding new messages from stream:", newMessages);
              setMessages((prevMessages) => {
                // Remove any existing messages that might be duplicates
                const existingIds = new Set(prevMessages.map((m) => m.id));
                const uniqueNewMessages = newMessages.filter(
                  (m) => !existingIds.has(m.id)
                );

                return [...prevMessages, ...uniqueNewMessages];
              });
            }
          }
          // Keep backward compatibility with old format
          else if (
            (event as any).event === "messages/partial" &&
            (event as any).data
          ) {
            const messageData = (event as any).data[0];
            console.log("messageData", messageData);
            setMessages((prevMessages) => {
              const currentMessages = [...prevMessages];
              const lastIndex = currentMessages.length - 1;
              if (lastIndex >= 0) {
                currentMessages[lastIndex] = messageData;
              }
              return currentMessages;
            });
          }
        }
      } finally {
        // Set streaming state to false when streaming completes
        setIsStreaming(false);

        // After streaming completes, fetch the current thread's messages and set them
        if (selectedThreadId) {
          console.log(
            "[StreamProvider] Fetching thread state after streaming completion for thread:",
            selectedThreadId
          );

          try {
            const threadState = await getThreadState(selectedThreadId);
            console.log("[StreamProvider] Thread state fetched:", threadState);

            // Extract messages from thread state
            const threadMessages = (threadState.values as any)?.messages;
            if (Array.isArray(threadMessages)) {
              console.log(
                "[StreamProvider] Setting messages from thread state:",
                threadMessages
              );
              setMessages(threadMessages);
            } else {
              console.log(
                "[StreamProvider] No messages found in thread state, keeping current messages"
              );
            }
          } catch (error) {
            console.error(
              "[StreamProvider] Failed to fetch thread state:",
              error
            );
            // Keep current messages on error
          }

          // Also invalidate thread state query for other components
          queryClient.invalidateQueries({
            queryKey: ["threadState", selectedThreadId],
          });
        }
      }
    }
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
    sendMessage,
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
