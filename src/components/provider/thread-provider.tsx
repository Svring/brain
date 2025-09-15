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
} from "@/lib/langgraph/langgraph-api/langgraph-trpc-service";
import { getThreadState } from "@/lib/langgraph/langgraph-api/langgraph-api";
import {
  useCreateNewChatSessionMutation,
  useDeleteThreadMutation,
  useUpdateThreadStateMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { getThreadStateOptions } from "@/lib/langgraph/langgraph-method/langgraph-query";
import { useQuery } from "@tanstack/react-query";
import { useMount } from "@reactuses/core";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

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
  const createNewThreadMutation = useCreateNewChatSessionMutation();

  // Get the latest thread (first in the sorted list)
  const latestThread = threads && threads.length > 0 ? threads[0] : null;
  const latestThreadId = latestThread?.thread_id || null;

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
      return;
    }

    const handleThreadManagement = async () => {
      try {
        let searchParams: any = {
          kubeconfig: auth.kubeconfig,
        };

        // Add project name if available
        if (selectedProject) {
          searchParams.projectName = selectedProject;
        }

        // Add resource target if available
        if (selectedResource) {
          searchParams.resourceTarget = selectedResource;
        }

        // Search for existing threads
        const existingThreads = await searchThreads(searchParams);

        if (existingThreads.length > 0) {
          // If threads are found, select the latest one
          const latestThread = existingThreads[0];
          if (latestThread?.thread_id) {
            enhancedSelectThread(latestThread.thread_id);
          }
          setThreads(existingThreads);
        } else {
          // If no threads found, create a new one
          createNewThreadMutation.mutate(undefined, {
            onSuccess: (data) => {
              if (data?.thread_id) {
                enhancedSelectThread(data.thread_id);
                // Refresh threads list
                getThreads().then(setThreads);
              }
            },
            onError: (error) => {
              console.error("Failed to create thread:", error);
            },
          });
        }
      } catch (error) {
        console.error("Failed to manage threads:", error);
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

  // Create thread on mount if no threads exist
  useMount(() => {
    if (!auth?.kubeconfig) {
      setIsInitializing(false);
      return;
    }

    // First, try to get existing threads
    getThreads().then((existingThreads) => {
      if (existingThreads.length > 0) {
        // If threads exist, select the latest one
        const latest = existingThreads[0];
        if (latest?.thread_id) {
          enhancedSelectThread(latest.thread_id);
        }
        setThreads(existingThreads);
        setIsInitializing(false);
      } else {
        // If no threads exist, create a new one
        createNewThreadMutation.mutate(undefined, {
          onSuccess: (data) => {
            if (data?.thread_id) {
              enhancedSelectThread(data.thread_id);
              // Refresh threads list
              getThreads().then(setThreads);
            }
            setIsInitializing(false);
          },
          onError: () => {
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
  const updateThreadStateMutation = useUpdateThreadStateMutation();

  // Delete thread mutation with selectThread to null logic
  const deleteThreadMutation = useDeleteThreadMutation();

  // Wrapper function for delete thread that selects null before deletion
  const deleteThread = (threadId: string) => {
    // Select null thread before deletion
    enhancedSelectThread(null);
    // Then delete the thread
    deleteThreadMutation.mutate(threadId);
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
