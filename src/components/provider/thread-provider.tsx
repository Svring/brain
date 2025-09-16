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
import {
  getThreadStateOptions,
  getThreadStateAtCheckpointOptions,
} from "@/lib/langgraph/langgraph-method/langgraph-query";
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
  setMessages: Dispatch<SetStateAction<Message[]>>;
  selectedCheckpointId: string | null;
  setSelectedCheckpointId: Dispatch<SetStateAction<string | null>>;
  selectThread: (threadId: string | null) => void;
  createNewThread: any;
  updateThreadState: any;
  deleteThread: any;
  isStreaming: boolean;
  setIsStreaming: Dispatch<SetStateAction<boolean>>;
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
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [justCreatedThreadId, setJustCreatedThreadId] = useState<string | null>(
    null
  );
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

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
      return [];
    } finally {
      setThreadsLoading(false);
    }
  }, [auth?.kubeconfig, selectedProject, selectedResource]);

  // Create new thread mutation
  const createNewThreadMutation = useMutation({
    ...useCreateNewChatSessionMutation(),
    onSuccess: (data: any) => {
      // Select the newly created thread immediately
      if (data?.thread_id) {
        setJustCreatedThreadId(data.thread_id);
        enhancedSelectThread(data.thread_id);
        
        // Clear messages immediately for new thread since it should be empty
        setMessages([]);

        // Refresh threads list after successful creation
        getThreads().then((threads) => {
          setThreads(threads);
          // Clear the flag after a short delay to allow useEffect hooks to run normally
          setTimeout(() => setJustCreatedThreadId(null), 1000);
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
        // Search for existing threads
        const existingThreads = await getThreads();

        if (existingThreads.length > 0) {
          // If threads are found, select the latest one (unless we just created a thread)
          const latestThread = existingThreads[0];
          if (latestThread?.thread_id && !justCreatedThreadId) {
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
                getThreads().then((threads) => {
                  setThreads(threads);
                });
              }
            },
            onError: (error) => {
              // Handle error silently
            },
          });
        }
      } catch (error) {
        // Handle error silently
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
    justCreatedThreadId,
  ]);

  // Handle thread management when selectedResource changes to null
  useEffect(() => {
    if (!auth?.kubeconfig || !sidebarChatOpen || selectedResource !== null) {
      return;
    }

    const handleResourceClearedThreadManagement = async () => {
      try {
        // Get existing threads
        const existingThreads = await getThreads();

        if (existingThreads.length > 0) {
          // If threads are found, select the latest one (unless we just created a thread)
          const latestThread = existingThreads[0];
          if (latestThread?.thread_id && !justCreatedThreadId) {
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
                getThreads().then((threads) => {
                  setThreads(threads);
                });
              }
            },
            onError: (error) => {
              // Handle error silently
            },
          });
        }
      } catch (error) {
        // Handle error silently
      }
    };

    handleResourceClearedThreadManagement();
  }, [
    selectedResource,
    auth?.kubeconfig,
    sidebarChatOpen,
    enhancedSelectThread,
    getThreads,
    justCreatedThreadId,
  ]);

  // Initialize ThreadProvider
  useMount(() => {
    setIsInitializing(false);
  });

  // Get the state of the latest thread if available
  const { data: latestThreadState, isLoading: threadStateLoading } = useQuery(
    getThreadStateOptions(latestThreadId || "")
  );

  // Get thread state (regular or at checkpoint)
  const { data: threadState, isLoading: threadStateLoading2 } = useQuery(
    getThreadStateOptions(selectedThreadId || "")
  );

  // Get thread state at checkpoint if checkpoint is specified
  const { data: checkpointThreadState, isLoading: checkpointStateLoading } =
    useQuery(
      getThreadStateAtCheckpointOptions(
        selectedThreadId || "",
        selectedCheckpointId || "",
        true // Include subgraphs
      )
    );

  // Effect to set messages based on checkpoint state
  // Skip updating messages if streaming is in progress
  useEffect(() => {
    // Skip updating messages if streaming is in progress
    if (isStreaming) return;

    // Don't update messages if no thread is selected
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }

    if (selectedCheckpointId && checkpointThreadState) {
      // Verify the checkpoint state belongs to the selected thread
      const checkpointThreadId = (checkpointThreadState as any)?.thread_id;
      if (checkpointThreadId && checkpointThreadId !== selectedThreadId) {
        // This checkpoint state is for a different thread, don't use it
        return;
      }
      
      const checkpointMessages = (checkpointThreadState.values as any)?.messages;
      if (Array.isArray(checkpointMessages)) {
        setMessages(checkpointMessages);
      } else {
        setMessages([]);
      }
    } else if (threadState) {
      // Verify the thread state belongs to the selected thread
      const stateThreadId = (threadState as any)?.thread_id;
      if (stateThreadId && stateThreadId !== selectedThreadId) {
        // This thread state is for a different thread, don't use it
        return;
      }
      
      const regularMessages = (threadState.values as any)?.messages;
      if (Array.isArray(regularMessages)) {
        setMessages(regularMessages);
      } else {
        setMessages([]);
      }
    } else {
      // Clear messages if no thread state is available
      setMessages([]);
    }
  }, [selectedCheckpointId, checkpointThreadState, threadState, isStreaming, selectedThreadId]);

  // Reset checkpoint when thread ID changes
  useEffect(() => {
    setSelectedCheckpointId(null);
  }, [selectedThreadId]);

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
    messages,
    setMessages,
    selectedCheckpointId,
    setSelectedCheckpointId,
    selectThread: enhancedSelectThread,
    createNewThread: createNewThreadMutation,
    updateThreadState: updateThreadStateMutation,
    deleteThread: {
      ...deleteThreadMutation,
      mutate: deleteThread,
    },
    isStreaming,
    setIsStreaming,
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
