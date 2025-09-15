import { useQuery } from "@tanstack/react-query";
import {
  listThreadsOptions,
  getThreadStateOptions,
  searchThreadsOptions,
} from "@/lib/langgraph/langgraph-method/langgraph-query";
import { useAuthState } from "@/contexts/auth/auth-context";
import {
  useCreateNewChatSessionMutation,
  useDeleteThreadMutation,
  useUpdateThreadStateMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useEffect } from "react";

export const useThreads = () => {
  const { auth } = useAuthState();
  const { selectThread } = useChatActions();
  const { selectedProject } = useProjectState();

  // Query threads with metadata for the current target
  const { data: threads, isLoading: threadsLoading } = useQuery(
    searchThreadsOptions({
      kubeconfig: auth?.kubeconfig || "",
      projectName: selectedProject,
    })
  );

  // Get the latest thread (first in the sorted list)
  const latestThread = threads && threads.length > 0 ? threads[0] : null;
  const latestThreadId = latestThread?.thread_id || null;

  useEffect(() => {
    selectThread(latestThreadId || null);
  }, [latestThreadId]);

  // Get the state of the latest thread if available
  const { data: latestThreadState, isLoading: threadStateLoading } = useQuery(
    getThreadStateOptions(latestThreadId || "")
  );

  // Create new thread mutation
  const createNewThreadMutation = useCreateNewChatSessionMutation();

  // Update thread state mutation
  const updateThreadStateMutation = useUpdateThreadStateMutation();

  // Delete thread mutation with selectThread to null logic
  const deleteThreadMutation = useDeleteThreadMutation();

  // Wrapper function for delete thread that selects null before deletion
  const deleteThread = (threadId: string) => {
    // Select null thread before deletion
    selectThread(null);
    // Then delete the thread
    deleteThreadMutation.mutate(threadId);
  };

  return {
    threads,
    threadsLoading,
    latestThread,
    latestThreadId,
    latestThreadState,
    threadStateLoading,
    hasThreads: threads && threads.length > 0,
    createNewThread: createNewThreadMutation,
    updateThreadState: updateThreadStateMutation,
    deleteThread: {
      ...deleteThreadMutation,
      mutate: deleteThread,
    },
  };
};
