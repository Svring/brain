import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import {
  useProjectActions,
  useProjectState,
} from "@/contexts/project/project-context";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import type { PendingMessage } from "@/contexts/chat/chat-machine";
import { toast } from "sonner";
import _ from "lodash";
import { useThreads } from "@/components/provider/thread-provider";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
  useLanggraphActions,
  useLanggraphState,
} from "@/contexts/langgraph/langgraph-context";
import { useStreamContext } from "@/components/provider/stream-provider";
import { Thread } from "@langchain/langgraph-sdk";
import { useAuthState } from "@/contexts/auth/auth-context";

interface UseNodeSelectParams {
  target: CustomResourceTarget | BuiltinResourceTarget;
  messageType?: string;
  payload?: unknown;
  onSuccess?: () => void;
}

export const useNodeSelect = ({
  target,
  messageType,
  payload,
  onSuccess,
}: UseNodeSelectParams) => {
  const { selectResource } = useProjectActions();
  const { selectNode } = useFlowgraphActions();
  const { openSidebarChat } = useChatActions();
  const { updateResourceContext } = useLanggraphActions();
  const {
    updateThreadState,
    threads,
    selectThread,
    createNewThread,
    getThreads,
  } = useThreads();
  const { selectedResource, selectedProject } = useProjectState();
  // const { submitWithContext } = useStreamContext();
  const { auth } = useAuthState();

  // Get resource status for the target
  const { resource: resource_context } = useResourceStatus(target);

  if (!target) {
    return {
      handleNodeSelect: () => {},
    };
  }

  const nodeId = `${target.resourceType?.toLowerCase() || "unknown"}-${
    target.name || ""
  }`;

  const handleNodeSelect = async (): Promise<string | null> => {
    if (target === selectedResource) {
      return null;
    }

    selectResource(target);
    selectNode(nodeId);
    updateResourceContext({
      selected_resource_context: resource_context,
    });

    // Fetch latest threads
    const latestThreads = await getThreads();

    // Find thread with matching resourceTarget in metadata
    const matchingThread = latestThreads.find((thread) => {
      const metadata = thread.metadata;
      if (metadata?.resourceTarget) {
        return metadata.resourceTarget === JSON.stringify(target);
      }
      return false;
    });

    let selectedThreadId: string | null = null;

    if (matchingThread) {
      // Select the matching thread
      selectedThreadId = matchingThread.thread_id;
      selectThread(selectedThreadId);
    } else {
      // No matching thread found, create a new thread and select it
      return new Promise((resolve, reject) => {
        createNewThread.mutate(
          {
            metadata: {
              kubeconfig: auth?.kubeconfig,
              projectName: selectedProject,
              resourceTarget: target,
            },
          },
          {
            onSuccess: (data: Thread) => {
              selectedThreadId = data.thread_id;
              selectThread(selectedThreadId);
              openSidebarChat();
              onSuccess?.();
              resolve(selectedThreadId);
            },
            onError: (error: any) => {
              console.error(
                "[useNodeSelect] Failed to create new thread:",
                error
              );
              reject(error);
            },
          }
        );
      });
    }

    openSidebarChat();
    onSuccess?.();

    return selectedThreadId;
  };

  return {
    nodeId,
    handleNodeSelect,
    updateThreadState,
  };
};
