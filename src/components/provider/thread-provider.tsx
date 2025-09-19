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
import {
  searchThreads,
  updateThreadState,
  deleteThread,
} from "@/lib/langgraph/langgraph-api/langgraph-api-service";
import {
  useDeleteThreadMutation,
  useUpdateThreadStateMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  getThreadStateOptions,
  getThreadStateAtCheckpointOptions,
} from "@/lib/langgraph/langgraph-method/langgraph-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { Message, Thread } from "@langchain/langgraph-sdk";

interface ThreadContextType {
  // Thread management
  getThreads: (projectName?: string | null) => Promise<any[]>;
  threads: Thread[];
  setThreads: Dispatch<SetStateAction<any[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;

  // Thread selection
  selectedThreadId: string | null;
  selectedThread: Thread | null;
  selectThread: (threadId: string | null) => void;

  // Messages
  // messages: Message[];
  // setMessages: Dispatch<SetStateAction<Message[]>>;

  // Checkpoints
  selectedCheckpointId: string | null;
  setSelectedCheckpointId: Dispatch<SetStateAction<string | null>>;

  // Mutations
  createNewThread: any;
  updateThreadState: any;
  deleteThread: any;

  // Streaming
  isStreaming: boolean;
  setIsStreaming: Dispatch<SetStateAction<boolean>>;

  // Thread state queries (for manual use)
  threadStateQuery: any;
  checkpointStateQuery: any;
  refetchThreadState: () => void;
  refetchCheckpointState: () => void;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuthState();
  const { selectedProject, selectedResource } = useProjectState();
  const { langgraph } = useTRPCClients();

  // State
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<
    string | null
  >(null);
  // const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // URL state management for threadId
  const [threadId, setThreadId] = useQueryState("threadId", {
    defaultValue: "",
  });

  // Get threads function
  const getThreads = useCallback(
    async (projectName?: string | null): Promise<Thread[]> => {
      if (!auth?.kubeconfig) return [];

      try {
        setThreadsLoading(true);
        const threads = await searchThreads({
          kubeconfig: auth.kubeconfig,
          projectName: projectName,
          graph_id: process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID || "orca",
        });
        return threads;
      } catch (error) {
        console.error("Failed to fetch threads:", error);
        return [];
      } finally {
        setThreadsLoading(false);
      }
    },
    [auth?.kubeconfig]
  );

  // Enhanced selectThread function that also updates URL state
  const enhancedSelectThread = useCallback(
    (threadId: string | null) => {
      setSelectedThreadId(threadId);
      setThreadId(threadId || "");
    },
    [setThreadId]
  );

  // Get the currently selected thread object
  const selectedThread = selectedThreadId
    ? threads.find((thread) => thread.thread_id === selectedThreadId) || null
    : null;

  // Create new thread mutation using TRPC
  const createNewThreadMutation = useMutation(
    langgraph.create.mutationOptions()
  );

  // Update thread state mutation
  const updateThreadStateMutation = useMutation({
    ...useUpdateThreadStateMutation(),
  });

  // Delete thread mutation
  const deleteThreadMutation = useDeleteThreadMutation();

  // Wrapper function for delete thread
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

  // Thread state queries (for manual use)
  const threadStateQuery = useQuery(
    getThreadStateOptions(selectedThreadId || "")
  );

  const checkpointStateQuery = useQuery(
    getThreadStateAtCheckpointOptions(
      selectedThreadId || "",
      selectedCheckpointId || "",
      true // Include subgraphs
    )
  );

  const value = {
    // Thread management
    getThreads,
    threads,
    setThreads,
    threadsLoading,
    setThreadsLoading,

    // Thread selection
    selectedThreadId,
    selectedThread,
    selectThread: enhancedSelectThread,

    // Checkpoints
    selectedCheckpointId,
    setSelectedCheckpointId,

    // Mutations
    createNewThread: createNewThreadMutation,
    updateThreadState: updateThreadStateMutation,
    deleteThread: {
      ...deleteThreadMutation,
      mutate: deleteThread,
    },

    // Streaming
    isStreaming,
    setIsStreaming,

    // Thread state queries (for manual use)
    threadStateQuery,
    checkpointStateQuery,
    refetchThreadState: threadStateQuery.refetch,
    refetchCheckpointState: checkpointStateQuery.refetch,
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
