"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
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
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";

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

interface ProjectChatInstanceProviderProps {
  projectName: string;
  children: ReactNode;
}

interface ResourceChatInstanceProviderProps {
  resourceTarget: ResourceTarget;
  children: ReactNode;
}

// Project Chat Instance Provider
export function ProjectChatInstanceProvider({
  projectName,
  children,
}: ProjectChatInstanceProviderProps) {
  const { getProjectChatInstance, focusedResourceTarget } = useChatState();
  const { setProjectChatThreadId, setProjectChatThreads, setProjectChatState } =
    useChatActions();
  const { getThreads, createNewThread } = useThreads();
  const { baseUrl, apiKey, modelName, contextWindowUsage, stage } =
    useLanggraphState();
  const { selectedProject, selectedProjectResources } = useProjectState();
  const { auth } = useAuthState();
  const { LANGGRAPH_DEPLOYMENT_URL, LANGGRAPH_GRAPH_ID } = useEnv();

  const chatInstance = getProjectChatInstance(projectName);
  const isActive = true; // project chat is always "active"
  const isFocused = focusedResourceTarget === getProjectChatKey(projectName);

  // Immediate validation: if threadId exists but is not in threads array, fix it immediately
  // But add a delay to avoid interfering with new thread creation
  useEffect(() => {
    if (
      chatInstance &&
      chatInstance.threadId &&
      chatInstance.threads.length > 0
    ) {
      const currentThreadExists = chatInstance.threads.some(
        (t) => t.thread_id === chatInstance.threadId
      );

      if (!currentThreadExists) {
        // Add a delay to allow new thread creation process to complete
        const timeoutId = setTimeout(() => {
          // Re-check if the thread still doesn't exist after the delay
          const currentInstance = getProjectChatInstance(projectName);
          if (
            currentInstance &&
            currentInstance.threadId &&
            currentInstance.threads.length > 0
          ) {
            const stillDoesntExist = !currentInstance.threads.some(
              (t) => t.thread_id === currentInstance.threadId
            );

            if (stillDoesntExist) {
              setProjectChatThreadId(
                projectName,
                currentInstance.threads[0].thread_id
              );
            }
          }
        }, 1500); // 2 second delay

        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    chatInstance?.threadId,
    chatInstance?.threads,
    projectName,
    setProjectChatThreadId,
    getProjectChatInstance,
  ]);

  // Ensure we only use a valid threadId that exists in the threads array
  const validThreadId = useMemo(() => {
    if (!chatInstance?.threadId || !chatInstance?.threads?.length) {
      return chatInstance?.threadId || null;
    }

    const threadExists = chatInstance.threads.some(
      (t) => t.thread_id === chatInstance.threadId
    );
    if (!threadExists) {
      return null; // Force useStream to not use invalid threadId
    }

    return chatInstance.threadId;
  }, [chatInstance?.threadId, chatInstance?.threads, projectName]);

  // Use useStream for this chat instance
  const streamValue = useStream({
    apiUrl: LANGGRAPH_DEPLOYMENT_URL,
    assistantId: LANGGRAPH_GRAPH_ID,
    threadId: validThreadId,
    onThreadId: async (id: string) => {
      setProjectChatThreadId(projectName, id);
    },
  });

  // Submit function for project chat
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
        ...data,
      },
      {
        ...options,
      }
    );
  };

  // Fetch threads for project chat
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const threads = await getThreads(null);

        setProjectChatThreads(projectName, threads);

        // Auto-select first thread if threads exist and either no thread is selected OR current thread is not in the list
        const currentThreadExists =
          chatInstance?.threadId &&
          threads.some((t) => t.thread_id === chatInstance.threadId);

        if (
          threads.length > 0 &&
          (!chatInstance?.threadId || !currentThreadExists)
        ) {
          const firstThread = threads[0];
          setProjectChatThreadId(projectName, firstThread.thread_id);
        }
        // Create new thread if no threads exist
        else if (threads.length === 0 && !chatInstance?.threadId) {
          createNewThread.mutate(
            {
              metadata: {
                kubeconfig: auth?.kubeconfig,
                projectName: selectedProject,
                resourceTarget: null,
                graph_id: LANGGRAPH_GRAPH_ID,
              },
            },
            {
              onSuccess: (data: any) => {
                if (data?.thread_id) {
                  setProjectChatThreadId(projectName, data.thread_id);
                }
              },
              onError: (error: any) => {
                console.error("Failed to create new thread:", error);
              },
            }
          );
        }
      } catch (error) {
        console.error("Failed to fetch threads for project:", error);
      }
    };

    if (isActive) {
      fetchThreads();
    }
  }, []); // Empty dependency array to run only once

  // Listen for custom event to trigger thread selection
  useEffect(() => {
    const handleThreadSelectionEvent = (event: CustomEvent) => {
      const { projectName: eventProjectName } = event.detail;

      // Check if this event is for this specific project
      if (eventProjectName === projectName && isActive) {
        // Re-trigger thread selection logic
        const fetchThreads = async () => {
          try {
            const threads = await getThreads(null);

            setProjectChatThreads(projectName, threads);

            // Auto-select first thread if threads exist and either no thread is selected OR current thread is not in the list
            const currentThreadExists =
              chatInstance?.threadId &&
              threads.some((t) => t.thread_id === chatInstance.threadId);

            if (
              threads.length > 0 &&
              (!chatInstance?.threadId || !currentThreadExists)
            ) {
              const firstThread = threads[0];
              setProjectChatThreadId(projectName, firstThread.thread_id);
            }
            // Create new thread if no threads exist
            else if (threads.length === 0 && !chatInstance?.threadId) {
              createNewThread.mutate(
                {
                  metadata: {
                    kubeconfig: auth?.kubeconfig,
                    projectName: selectedProject,
                    resourceTarget: null,
                    graph_id: LANGGRAPH_GRAPH_ID,
                  },
                },
                {
                  onSuccess: (data: any) => {
                    if (data?.thread_id) {
                      setProjectChatThreadId(projectName, data.thread_id);
                    }
                  },
                  onError: (error: any) => {
                    console.error("Failed to create new thread:", error);
                  },
                }
              );
            }
          } catch (error) {
            console.error("Failed to fetch threads for project:", error);
          }
        };

        fetchThreads();
      }
    };

    window.addEventListener(
      "triggerProjectThreadSelection",
      handleThreadSelectionEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "triggerProjectThreadSelection",
        handleThreadSelectionEvent as EventListener
      );
    };
  }, [
    projectName,
    isActive,
    chatInstance?.threadId,
    auth?.kubeconfig,
    selectedProject,
    LANGGRAPH_GRAPH_ID,
  ]);

  // Default values if chat instance doesn't exist yet
  const defaultState: ChatSectionState = {
    open: false,
    responding: false,
    maximized: false,
    loading: false,
  };

  const value: ChatInstanceContextType = {
    ...streamValue,
    resourceTarget: null,
    threadId: validThreadId,
    threads: chatInstance?.threads || [],
    state: chatInstance?.state || defaultState,
    isActive,
    isFocused,
    setChatThreadId: (threadId: string | null) =>
      setProjectChatThreadId(projectName, threadId),
    setChatThreads: (threads: Thread[]) =>
      setProjectChatThreads(projectName, threads),
    setChatState: (state: Partial<ChatSectionState>) =>
      setProjectChatState(projectName, state),
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

// Resource Chat Instance Provider
export function ResourceChatInstanceProvider({
  resourceTarget,
  children,
}: ResourceChatInstanceProviderProps) {
  const { getChatInstance, isResourceActive, focusedResourceTarget } =
    useChatState();
  const { setChatThreadId, setChatThreads, setChatState } = useChatActions();
  const { getThreads, createNewThread } = useThreads();
  const { baseUrl, apiKey, modelName, contextWindowUsage, stage } =
    useLanggraphState();
  const { selectedProject, selectedProjectResources } = useProjectState();
  const { auth } = useAuthState();
  const { LANGGRAPH_DEPLOYMENT_URL, LANGGRAPH_GRAPH_ID } = useEnv();

  // Get current resource data using useResourceStatus
  const { resource: selectedResourceContext } =
    useResourceStatus(resourceTarget);

  const chatInstance = getChatInstance(resourceTarget);
  const isActive = isResourceActive(resourceTarget);
  const isFocused =
    focusedResourceTarget === serializeResourceTarget(resourceTarget);

  // Immediate validation: if threadId exists but is not in threads array, fix it immediately
  // But add a delay to avoid interfering with new thread creation
  useEffect(() => {
    if (
      chatInstance &&
      chatInstance.threadId &&
      chatInstance.threads.length > 0
    ) {
      const currentThreadExists = chatInstance.threads.some(
        (t) => t.thread_id === chatInstance.threadId
      );

      if (!currentThreadExists) {
        // Add a delay to allow new thread creation process to complete
        const timeoutId = setTimeout(() => {
          // Re-check if the thread still doesn't exist after the delay
          const currentInstance = getChatInstance(resourceTarget);
          if (
            currentInstance &&
            currentInstance.threadId &&
            currentInstance.threads.length > 0
          ) {
            const stillDoesntExist = !currentInstance.threads.some(
              (t) => t.thread_id === currentInstance.threadId
            );

            if (stillDoesntExist) {
              setChatThreadId(
                resourceTarget,
                currentInstance.threads[0].thread_id
              );
            }
          }
        }, 500); // 2 second delay

        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    chatInstance?.threadId,
    chatInstance?.threads,
    resourceTarget,
    setChatThreadId,
    getChatInstance,
  ]);

  // Ensure we only use a valid threadId that exists in the threads array
  const validThreadId = useMemo(() => {
    if (!chatInstance?.threadId || !chatInstance?.threads?.length) {
      return chatInstance?.threadId || null;
    }

    const threadExists = chatInstance.threads.some(
      (t) => t.thread_id === chatInstance.threadId
    );
    if (!threadExists) {
      return null; // Force useStream to not use invalid threadId
    }

    return chatInstance.threadId;
  }, [chatInstance?.threadId, chatInstance?.threads, resourceTarget]);

  // Use useStream for this chat instance
  const streamValue = useStream({
    apiUrl: LANGGRAPH_DEPLOYMENT_URL,
    assistantId: LANGGRAPH_GRAPH_ID,
    threadId: validThreadId,
    onThreadId: async (id: string) => {
      setChatThreadId(resourceTarget, id);
    },
  });

  // Submit function for resource chat
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
        resource_context: {
          selectedResource: resourceTarget,
          selectedResourceContext,
        },
        ...data,
      },
      {
        ...options,
      }
    );
  };

  // Fetch threads for resource chat
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const threads = await getThreads(resourceTarget);
        setChatThreads(resourceTarget, threads);

        // Auto-select first thread if threads exist and no thread is currently selected
        if (threads.length > 0 && !chatInstance?.threadId) {
          const firstThread = threads[0];
          setChatThreadId(resourceTarget, firstThread.thread_id);
        }
        // Create new thread if no threads exist
        else if (threads.length === 0 && !chatInstance?.threadId) {
          createNewThread.mutate(
            {
              metadata: {
                kubeconfig: auth?.kubeconfig,
                projectName: selectedProject,
                resourceTarget: resourceTarget,
                graph_id: LANGGRAPH_GRAPH_ID,
              },
            },
            {
              onSuccess: (data: any) => {
                if (data?.thread_id) {
                  setChatThreadId(resourceTarget, data.thread_id);
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
  }, []); // Empty dependency array to run only once

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
    threadId: validThreadId,
    threads: chatInstance?.threads || [],
    state: chatInstance?.state || defaultState,
    isActive,
    isFocused,
    setChatThreadId: (threadId: string | null) =>
      setChatThreadId(resourceTarget, threadId),
    setChatThreads: (threads: Thread[]) =>
      setChatThreads(resourceTarget, threads),
    setChatState: (state: Partial<ChatSectionState>) =>
      setChatState(resourceTarget, state),
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

// Main ChatInstanceProvider that returns the appropriate provider
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
  // Determine which provider to use
  const isProjectChat = Boolean(projectName && !resourceTarget);
  const isResourceChat = Boolean(resourceTarget && !projectName);

  if (!isProjectChat && !isResourceChat) {
    throw new Error(
      "ChatInstanceProvider must have either resourceTarget or projectName, but not both"
    );
  }

  if (isProjectChat) {
    return (
      <ProjectChatInstanceProvider projectName={projectName!}>
        {children}
      </ProjectChatInstanceProvider>
    );
  }

  return (
    <ResourceChatInstanceProvider resourceTarget={resourceTarget!}>
      {children}
    </ResourceChatInstanceProvider>
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
