"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useChatState } from "@/contexts/chat/chat-context";
import {
  searchThreads,
  updateThreadState,
  deleteThread,
} from "@/lib/langgraph/langgraph-api/langgraph-api-service";
import { getThreadState } from "@/lib/langgraph/langgraph-api/langgraph-api";
import {
  useCreateNewChatSessionMutation,
  useDeleteThreadMutation,
  useUpdateThreadStateMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { getThreadStateOptions } from "@/lib/langgraph/langgraph-method/langgraph-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useMount } from "@reactuses/core";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { Message } from "@langchain/langgraph-sdk";

interface ThreadContextType {
  getThreads: () => Promise<any[]>;
  threads: any[];
  setThreads: Dispatch<SetStateAction<any[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
  latestThread: any;
  latestThreadId: string | null;
  latestThreadState: any;
  threadStateLoading: boolean;
  hasThreads: boolean;
  selectedThreadId: string | null;
  selectedThread: any;
  messages: Message[];
  selectThread: (threadId: string | null) => void;
  createNewThread: any;
  updateThreadState: any;
  deleteThread: any;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuthState();
  const { selectedProject, selectedResource } = useProjectState();
  const { sidebarChatOpen } = useChatState();
  const [threads, setThreads] = useState<any[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // URL state management for threadId
  const [threadId, setThreadId] = useQueryState("threadId", {
    defaultValue: "",
  });

  const getThreads = useCallback(async (): Promise<any[]> => {
    if (!auth?.kubeconfig) return [];

    try {
      setThreadsLoading(true);
      const threads = await searchThreads({
        kubeconfig: auth.kubeconfig,
        projectName: selectedProject,
        resourceTarget: selectedResource,
        graph_id: process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID || "orca",
      });
      return threads;
    } catch (error) {
      console.error("Failed to fetch threads:", error);
      return [];
    } finally {
      setThreadsLoading(false);
    }
  }, [auth?.kubeconfig, selectedProject, selectedResource]);

  // Create new thread mutation
  const createNewThreadMutation = useMutation({
    ...useCreateNewChatSessionMutation(),
    onSuccess: (data: any) => {
      console.log(
        "[ThreadProvider] Thread creation succeeded with data:",
        data
      );
      
      // Refresh threads list after successful creation
      if (data?.thread_id) {
        getThreads().then((threads) => {
          console.log(
            "[ThreadProvider] Refreshed threads after creation:",
            threads
          );
          setThreads(threads);
        });
      }
    },
  });

  // Get the latest thread (first in the sorted list)
  const latestThread = threads && threads.length > 0 ? threads[0] : null;
  const latestThreadId = latestThread?.thread_id || null;

  // Get the currently selected thread object
  const selectedThread = selectedThreadId
    ? threads.find((thread) => thread.thread_id === selectedThreadId) || null
    : null;

  // Get the messages from the selected thread
  const selectedThreadMessages = selectedThread?.values?.messages || [];

  // Enhanced selectThread function that also updates URL state
  const enhancedSelectThread = useCallback(
    (threadId: string | null) => {
      setSelectedThreadId(threadId);
      setThreadId(threadId || "");
    },
    [setThreadId]
  );

  // Sync URL state with internal state
  useEffect(() => {
    if (threadId && threadId !== selectedThreadId) {
      setSelectedThreadId(threadId);
    }
  }, [threadId, selectedThreadId]);

  // Handle thread management based on sidebar chat state and project context
  useEffect(() => {
    if (!auth?.kubeconfig || !sidebarChatOpen) {
      console.log(
        "[ThreadProvider] Skipping thread management: missing kubeconfig or sidebarChatOpen is false",
        {
          kubeconfig: !!auth?.kubeconfig,
          sidebarChatOpen,
        }
      );
      return;
    }

    const handleThreadManagement = async () => {
      try {
        // Search for existing threads
        const existingThreads = await getThreads();

        console.log("[ThreadProvider] Found threads:", existingThreads);

        if (existingThreads.length > 0) {
          // If threads are found, select the latest one
          const latestThread = existingThreads[0];
          console.log(
            "[ThreadProvider] Selecting latest thread:",
            latestThread?.thread_id
          );
          if (latestThread?.thread_id) {
            enhancedSelectThread(latestThread.thread_id);
          }
          setThreads(existingThreads);
        } else {
          // If no threads found, create a new one
          console.log(
            "[ThreadProvider] No threads found, creating a new thread..."
          );
          createNewThreadMutation.mutate(undefined, {
            onSuccess: (data) => {
              console.log(
                "[ThreadProvider] Successfully created new thread:",
                data
              );
              if (data?.thread_id) {
                enhancedSelectThread(data.thread_id);
                // Refresh threads list
                getThreads().then((threads) => {
                  console.log(
                    "[ThreadProvider] Refreshed threads after creation:",
                    threads
                  );
                  setThreads(threads);
                });
              }
            },
            onError: (error) => {
              console.error("[ThreadProvider] Failed to create thread:", error);
            },
          });
        }
      } catch (error) {
        console.error("[ThreadProvider] Failed to manage threads:", error);
      }
    };

    handleThreadManagement();
  }, [
    sidebarChatOpen,
    auth?.kubeconfig,
    selectedProject,
    selectedResource,
    enhancedSelectThread,
    getThreads,
  ]);

  // Handle thread management when selectedResource changes to null
  useEffect(() => {
    if (!auth?.kubeconfig || !sidebarChatOpen || selectedResource !== null) {
      return;
    }

    console.log(
      "[ThreadProvider] selectedResource changed to null, managing threads..."
    );

    const handleResourceClearedThreadManagement = async () => {
      try {
        // Get existing threads
        const existingThreads = await getThreads();

        console.log("[ThreadProvider] Existing threads:", existingThreads);

        console.log(
          "[ThreadProvider] Found threads after resource cleared:",
          existingThreads
        );

        if (existingThreads.length > 0) {
          // If threads are found, select the latest one
          const latestThread = existingThreads[0];
          console.log(
            "[ThreadProvider] Selecting latest thread after resource cleared:",
            latestThread?.thread_id
          );
          if (latestThread?.thread_id) {
            enhancedSelectThread(latestThread.thread_id);
          }
          setThreads(existingThreads);
        } else {
          // If no threads found, create a new one
          console.log(
            "[ThreadProvider] No threads found after resource cleared, creating a new thread..."
          );
          createNewThreadMutation.mutate(undefined, {
            onSuccess: (data) => {
              console.log(
                "[ThreadProvider] Successfully created new thread after resource cleared:",
                data
              );
              if (data?.thread_id) {
                enhancedSelectThread(data.thread_id);
                // Refresh threads list
                getThreads().then((threads) => {
                  console.log(
                    "[ThreadProvider] Refreshed threads after creation (resource cleared):",
                    threads
                  );
                  setThreads(threads);
                });
              }
            },
            onError: (error) => {
              console.error(
                "[ThreadProvider] Failed to create thread after resource cleared:",
                error
              );
            },
          });
        }
      } catch (error) {
        console.error(
          "[ThreadProvider] Failed to manage threads after resource cleared:",
          error
        );
      }
    };

    handleResourceClearedThreadManagement();
  }, [selectedResource, auth?.kubeconfig, sidebarChatOpen, enhancedSelectThread, getThreads]);

  // Create thread on mount if no threads exist
  useMount(() => {
    if (!auth?.kubeconfig) {
      console.log(
        "[ThreadProvider] No kubeconfig on mount, skipping thread initialization."
      );
      setIsInitializing(false);
      return;
    }

    // Skip creating new thread if selectedProject or selectedResource is present
    if (selectedProject || selectedResource) {
      console.log(
        "[ThreadProvider] selectedProject or selectedResource present on mount, skipping thread creation:",
        { selectedProject, selectedResource }
      );
      setIsInitializing(false);
      return;
    }

    // First, try to get existing threads
    getThreads().then((existingThreads) => {
      console.log("[ThreadProvider] Threads on mount:", existingThreads);
      if (existingThreads.length > 0) {
        // If threads exist, select the latest one
        const latest = existingThreads[0];
        console.log(
          "[ThreadProvider] Selecting latest thread on mount:",
          latest?.thread_id
        );
        if (latest?.thread_id) {
          enhancedSelectThread(latest.thread_id);
        }
        setThreads(existingThreads);
        setIsInitializing(false);
      } else {
        // If no threads exist, create a new one
        console.log(
          "[ThreadProvider] No threads on mount, creating a new thread..."
        );
        createNewThreadMutation.mutate(undefined, {
          onSuccess: (data) => {
            console.log(
              "[ThreadProvider] Successfully created new thread on mount:",
              data
            );
            if (data?.thread_id) {
              enhancedSelectThread(data.thread_id);
              // Refresh threads list
              getThreads().then((threads) => {
                console.log(
                  "[ThreadProvider] Refreshed threads after creation on mount:",
                  threads
                );
                setThreads(threads);
              });
            }
            setIsInitializing(false);
          },
          onError: (error) => {
            console.error(
              "[ThreadProvider] Failed to create thread on mount:",
              error
            );
            setIsInitializing(false);
          },
        });
      }
    });
  });

  // Get the state of the latest thread if available
  const { data: latestThreadState, isLoading: threadStateLoading } = useQuery(
    getThreadStateOptions(latestThreadId || "")
  );

  // Update thread state mutation
  const updateThreadStateMutation = useMutation({
    ...useUpdateThreadStateMutation(),
  });

  // Delete thread mutation with selectThread to null logic
  const deleteThreadMutation = useDeleteThreadMutation();

  // Wrapper function for delete thread that selects null before deletion
  const deleteThread = (threadId: string) => {
    // Select null thread before deletion
    enhancedSelectThread(null);
    // Then delete the thread
    deleteThreadMutation.mutate(threadId, {
      onSuccess: () => {
        // Refresh threads list after successful deletion
        getThreads().then((updatedThreads) => {
          console.log("[ThreadProvider] Threads after deletion:", updatedThreads);
          setThreads(updatedThreads);
        });
      },
    });
  };

  const value = {
    getThreads,
    threads,
    setThreads,
    threadsLoading,
    setThreadsLoading,
    latestThread,
    latestThreadId,
    latestThreadState,
    threadStateLoading,
    hasThreads: threads && threads.length > 0,
    selectedThreadId,
    selectedThread,
    messages: selectedThreadMessages,
    selectThread: enhancedSelectThread,
    createNewThread: createNewThreadMutation,
    updateThreadState: updateThreadStateMutation,
    deleteThread: {
      ...deleteThreadMutation,
      mutate: deleteThread,
    },
  };

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}

export function useThreads() {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreads must be used within a ThreadProvider");
  }
  return context;
}
