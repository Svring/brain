import { useQuery } from "@tanstack/react-query";
import {
  searchThreadsOptions,
  getThreadStateOptions,
} from "@/lib/langgraph/langgraph-method/langgraph-query";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useProjectState } from "@/contexts/project/project-context";
import { convertThreadToCopilotKitMessages } from "@/lib/langgraph/langgraph-method/langgraph-utils";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useEffect } from "react";

export const useThreads = () => {
  const { auth } = useAuthState();
  const { selectedProject, selectedResource } = useProjectState();
  const kubeconfig = auth?.kubeconfig;
  const { setMessages } = useCopilotChatHeadless_c();

  // Query threads with metadata for the current target
  const { data: threads, isLoading: threadsLoading } = useQuery(
    searchThreadsOptions({
      kubeconfig,
      projectName: selectedProject,
      resourceTarget: selectedResource || null,
    })
  );

  // Extract and convert messages from each thread
  // if (threads && threads.length > 0) {
  //   threads.forEach((thread, index) => {
  //     console.log(`\n--- Thread ${index + 1} (${thread.thread_id}) ---`);

  //     // 1. Extract messages from thread
  //     const extractedMessages = extractLanggraphMessages(thread);
  //     console.log("Extracted messages:", extractedMessages);

  //     // 2. Convert messages to CopilotKit format
  //     const convertedMessages = convertToCopilotKitMessages(extractedMessages);
  //     console.log("Converted messages:", convertedMessages);
  //   });
  // }

  // Get the latest thread (first in the sorted list)
  const latestThread = threads && threads.length > 0 ? threads[0] : null;
  const latestThreadId = latestThread?.thread_id || null;

  // Get the state of the latest thread if available
  const { data: latestThreadState, isLoading: threadStateLoading } = useQuery(
    getThreadStateOptions(latestThreadId || "")
  );

  return {
    threads,
    threadsLoading,
    latestThread,
    latestThreadId,
    latestThreadState,
    threadStateLoading,
    hasThreads: threads && threads.length > 0,
  };
};
