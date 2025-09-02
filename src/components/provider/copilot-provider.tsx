"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { useChatState, useChatActions } from "@/contexts/chat/chat-context";
import { useMutation } from "@tanstack/react-query";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMount } from "@reactuses/core";

// Component for creating threads
function ThreadCreator({ children }: { children: React.ReactNode }) {
  const { selectedThreadId } = useChatState();
  const { selectThread } = useChatActions();
  const { langgraph } = useTRPCClients();
  const { auth } = useAuthState();

  const createThreadMutation = useMutation(
    langgraph.createThread.mutationOptions({
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Creating chat thread...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (createThreadMutation.isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to create chat thread</p>
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-sm text-gray-600">Preparing chat...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Component for rendering CopilotKit with thread
function CopilotKitRenderer({ children }: { children: React.ReactNode }) {
  const { selectedThreadId } = useChatState();
  console.log("selectedThreadId in CopilotKitRenderer", selectedThreadId);

  return (
    <CopilotKit
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
