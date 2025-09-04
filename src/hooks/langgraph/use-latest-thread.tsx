import { useQuery } from "@tanstack/react-query";
import { searchThreadsOptions, getThreadStateOptions } from "@/lib/langgraph/langgraph-method/langgraph-query";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";

interface UseLatestThreadParams {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const useLatestThread = ({ target }: UseLatestThreadParams) => {
  const { auth } = useAuthState();
  const { selectedProject } = useProjectState();

  // Query threads with metadata for the current target
  const { data: threads, isLoading: threadsLoading } = useQuery(
    searchThreadsOptions({
      kubeconfig: auth?.kubeconfig,
      projectName: selectedProject,
      resourceTarget: target,
    })
  );

  // Get the latest thread ID (first in the sorted list)
  const latestThreadId = threads && threads.length > 0 ? threads[0].thread_id : null;

  // Get the state of the latest thread if available
  const { data: latestThreadState, isLoading: threadStateLoading } = useQuery(
    getThreadStateOptions(latestThreadId || "")
  );

  return {
    threads,
    threadsLoading,
    latestThreadId,
    latestThreadState,
    threadStateLoading,
    hasThreads: threads && threads.length > 0,
  };
};
