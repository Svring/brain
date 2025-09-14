import { useQuery } from "@tanstack/react-query";
import {
  searchThreadsOptions,
  getThreadStateOptions,
} from "@/lib/langgraph/langgraph-method/langgraph-query";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

export const useThreads = () => {
  const { auth } = useAuthState();
  const { selectedProject, selectedResource } = useProjectState();
  const kubeconfig = auth?.kubeconfig;

  // Query threads with metadata for the current target
  const { data: threads, isLoading: threadsLoading } = useQuery(
    searchThreadsOptions({
      kubeconfig,
      projectName: selectedProject,
      resourceTarget: selectedResource || null,
    })
  );

  // Get the latest thread (first in the sorted list)
  const latestThread = threads && threads.length > 0 ? threads[0] : null;
  const latestThreadId = latestThread?.thread_id || null;

  // Get the state of the latest thread if available
  const { data: latestThreadState, isLoading: threadStateLoading } = useQuery(
    getThreadStateOptions(latestThreadId || "")
  );

  // Create new thread mutation
  const createNewThreadMutation = useCreateNewChatSessionMutation();

  return {
    threads,
    threadsLoading,
    latestThread,
    latestThreadId,
    latestThreadState,
    threadStateLoading,
    hasThreads: threads && threads.length > 0,
    createNewThread: createNewThreadMutation,
  };
};
