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

  console.log("chatInstance", chatInstance);

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
        console.log(
          "ProjectChatInstanceProvider - DETECTED: Current threadId not in threads array:",
          {
            projectName,
            invalidThreadId: chatInstance.threadId,
            availableThreads: chatInstance.threads.map((t) => t.thread_id),
            willFixIn: "2 seconds (to allow new thread creation)",
          }
        );

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
              console.log(
                "ProjectChatInstanceProvider - DELAYED FIX: Current threadId still not in threads array:",
                {
                  projectName,
                  invalidThreadId: currentInstance.threadId,
                  availableThreads: currentInstance.threads.map(
                    (t) => t.thread_id
                  ),
                  fixingTo: currentInstance.threads[0].thread_id,
                }
              );

              setProjectChatThreadId(
                projectName,
                currentInstance.threads[0].thread_id
              );
            } else {
              console.log(
                "ProjectChatInstanceProvider - NO FIX NEEDED: Thread was found after delay (likely new thread creation completed):",
                {
                  projectName,
                  threadId: currentInstance.threadId,
                }
              );
            }
          }
        }, 2000); // 2 second delay

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
      console.log(
        "ProjectChatInstanceProvider - useStream: Invalid threadId detected, using null:",
        {
          projectName,
          invalidThreadId: chatInstance.threadId,
          availableThreads: chatInstance.threads.map((t) => t.thread_id),
        }
      );
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
      console.log(
        "ProjectChatInstanceProvider - Initial thread fetch started:",
        {
          projectName,
          isActive,
          currentThreadId: chatInstance?.threadId,
        }
      );

      try {
        const threads = await getThreads(null);
        console.log("ProjectChatInstanceProvider - Threads fetched:", {
          projectName,
          threadCount: threads.length,
          threads: threads.map((t) => ({
            id: t.thread_id,
            created_at: t.created_at,
          })),
        });

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
          console.log(
            "ProjectChatInstanceProvider - Auto-selecting first thread:",
            {
              threadId: firstThread.thread_id,
              projectName,
              threadCreatedAt: firstThread.created_at,
              reason: !chatInstance?.threadId
                ? "no thread selected"
                : "current thread not in list",
              currentThreadId: chatInstance?.threadId,
              availableThreads: threads.map((t) => t.thread_id),
            }
          );

          setProjectChatThreadId(projectName, firstThread.thread_id);
        }
        // Create new thread if no threads exist
        else if (threads.length === 0 && !chatInstance?.threadId) {
          console.log(
            "ProjectChatInstanceProvider - No threads exist, creating new thread:",
            {
              projectName,
              selectedProject,
              graphId: LANGGRAPH_GRAPH_ID,
            }
          );

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
                console.log(
                  "ProjectChatInstanceProvider - New thread created successfully:",
                  {
                    projectName,
                    threadId: data?.thread_id,
                  }
                );
                if (data?.thread_id) {
                  setProjectChatThreadId(projectName, data.thread_id);
                }
              },
              onError: (error: any) => {
                console.error(
                  "ProjectChatInstanceProvider - Failed to create new thread:",
                  {
                    projectName,
                    error,
                  }
                );
              },
            }
          );
        } else {
          console.log(
            "ProjectChatInstanceProvider - No action needed for thread selection:",
            {
              projectName,
              threadCount: threads.length,
              currentThreadId: chatInstance?.threadId,
              currentThreadExists,
              reason:
                threads.length === 0
                  ? "no threads available"
                  : "valid thread already selected",
            }
          );
        }
      } catch (error) {
        console.error(
          "ProjectChatInstanceProvider - Failed to fetch threads for project:",
          {
            projectName,
            error,
          }
        );
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

      console.log(
        "ProjectChatInstanceProvider - Received triggerProjectThreadSelection event:",
        {
          eventProjectName,
          currentProjectName: projectName,
          isActive,
          currentThreadId: chatInstance?.threadId,
        }
      );

      // Check if this event is for this specific project
      if (eventProjectName === projectName && isActive) {
        console.log(
          "ProjectChatInstanceProvider - Event matches current project, triggering thread selection:",
          {
            projectName,
            isActive,
          }
        );

        // Re-trigger thread selection logic
        const fetchThreads = async () => {
          console.log(
            "ProjectChatInstanceProvider - Event-triggered thread fetch started:",
            {
              projectName,
              currentThreadId: chatInstance?.threadId,
            }
          );

          try {
            const threads = await getThreads(null);
            console.log(
              "ProjectChatInstanceProvider - Event-triggered threads fetched:",
              {
                projectName,
                threadCount: threads.length,
                threads: threads.map((t) => ({
                  id: t.thread_id,
                  created_at: t.created_at,
                })),
              }
            );

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
              console.log(
                "ProjectChatInstanceProvider - Event-triggered auto-selecting first thread:",
                {
                  threadId: firstThread.thread_id,
                  projectName,
                  threadCreatedAt: firstThread.created_at,
                  reason: !chatInstance?.threadId
                    ? "no thread selected"
                    : "current thread not in list",
                  currentThreadId: chatInstance?.threadId,
                  availableThreads: threads.map((t) => t.thread_id),
                }
              );

              setProjectChatThreadId(projectName, firstThread.thread_id);
            }
            // Create new thread if no threads exist
            else if (threads.length === 0 && !chatInstance?.threadId) {
              console.log(
                "ProjectChatInstanceProvider - Event-triggered no threads exist, creating new thread:",
                {
                  projectName,
                  selectedProject,
                  graphId: LANGGRAPH_GRAPH_ID,
                }
              );

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
                    console.log(
                      "ProjectChatInstanceProvider - Event-triggered new thread created successfully:",
                      {
                        projectName,
                        threadId: data?.thread_id,
                      }
                    );
                    if (data?.thread_id) {
                      setProjectChatThreadId(projectName, data.thread_id);
                    }
                  },
                  onError: (error: any) => {
                    console.error(
                      "ProjectChatInstanceProvider - Event-triggered failed to create new thread:",
                      {
                        projectName,
                        error,
                      }
                    );
                  },
                }
              );
            } else {
              console.log(
                "ProjectChatInstanceProvider - Event-triggered no action needed for thread selection:",
                {
                  projectName,
                  threadCount: threads.length,
                  currentThreadId: chatInstance?.threadId,
                  currentThreadExists,
                  reason:
                    threads.length === 0
                      ? "no threads available"
                      : "valid thread already selected",
                }
              );
            }
          } catch (error) {
            console.error(
              "ProjectChatInstanceProvider - Event-triggered failed to fetch threads for project:",
              {
                projectName,
                error,
              }
            );
          }
        };

        fetchThreads();
      } else {
        console.log("ProjectChatInstanceProvider - Event ignored:", {
          reason:
            eventProjectName !== projectName
              ? "different project"
              : "not active",
          eventProjectName,
          currentProjectName: projectName,
          isActive,
        });
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
        console.log(
          "ResourceChatInstanceProvider - DETECTED: Current threadId not in threads array:",
          {
            resourceTarget,
            invalidThreadId: chatInstance.threadId,
            availableThreads: chatInstance.threads.map((t) => t.thread_id),
            willFixIn: "2 seconds (to allow new thread creation)",
          }
        );

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
              console.log(
                "ResourceChatInstanceProvider - DELAYED FIX: Current threadId still not in threads array:",
                {
                  resourceTarget,
                  invalidThreadId: currentInstance.threadId,
                  availableThreads: currentInstance.threads.map(
                    (t) => t.thread_id
                  ),
                  fixingTo: currentInstance.threads[0].thread_id,
                }
              );

              setChatThreadId(
                resourceTarget,
                currentInstance.threads[0].thread_id
              );
            } else {
              console.log(
                "ResourceChatInstanceProvider - NO FIX NEEDED: Thread was found after delay (likely new thread creation completed):",
                {
                  resourceTarget,
                  threadId: currentInstance.threadId,
                }
              );
            }
          }
        }, 2000); // 2 second delay

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
      console.log(
        "ResourceChatInstanceProvider - useStream: Invalid threadId detected, using null:",
        {
          resourceTarget,
          invalidThreadId: chatInstance.threadId,
          availableThreads: chatInstance.threads.map((t) => t.thread_id),
        }
      );
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
          console.log(
            "ResourceChatInstanceProvider - Auto-selecting first thread:",
            {
              threadId: firstThread.thread_id,
              resourceTarget,
            }
          );

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
