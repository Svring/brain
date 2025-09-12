"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { useMutation } from "@tanstack/react-query";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMount } from "@reactuses/core";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

// Component for creating threads
function ThreadCreator({ children }: { children: React.ReactNode }) {
  const { selectedThreadId } = useChatState();
  const { selectThread } = useChatActions();
  const { langgraph } = useTRPCClients();
  const { auth } = useAuthState();

  const createThreadMutation = useMutation(
    langgraph.create.mutationOptions({
      onSuccess: (newThread) => {
        // Select the newly created thread
        selectThread(newThread.thread_id);
      },
    })
  );

  // Create thread on mount if none exists and auth is available
  useMount(() => {
    if (!selectedThreadId && auth?.kubeconfig) {
      createThreadMutation.mutate({ kubeconfig: auth.kubeconfig });
    }
  });

  // Loading state
  if (createThreadMutation.isPending) {
    return <LoadingScreen text="Creating chat thread..." />;
  }

  // Error state
  if (createThreadMutation.isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-theme-red mb-2">Failed to create chat thread</p>
          <button
            onClick={() => createThreadMutation.reset()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Don't render children until thread is available
  if (!selectedThreadId) {
    return <LoadingScreen text="Initializing chat..." />;
  }

  return <>{children}</>;
}

// Component for rendering CopilotKit with thread
function CopilotKitRenderer({ children }: { children: React.ReactNode }) {
  const { selectedThreadId } = useChatState();

  const [threadId, setThreadId] = useQueryState("threadId");

  console.log("selectedThreadId", selectedThreadId);
  console.log("threadId", threadId);

  useEffect(() => {
    if (selectedThreadId) {
      setThreadId(selectedThreadId);
    }
  }, [selectedThreadId]);

  return (
    <CopilotKit
      // showDevConsole={false}
      agent="orca"
      runtimeUrl="/api/copilot"
      publicApiKey={process.env.NEXT_PUBLIC_COPILOT_API_KEY}
      threadId={selectedThreadId}
    >
      {children}
    </CopilotKit>
  );
}

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThreadCreator>
      <CopilotKitRenderer>{children}</CopilotKitRenderer>
    </ThreadCreator>
  );
}
