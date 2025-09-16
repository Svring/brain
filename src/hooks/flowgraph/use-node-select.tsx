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
    getThreads,
    setThreads,
    selectThread,
    setMessages,
    createNewThread,
  } = useThreads();
  const { selectedResource, selectedProject } = useProjectState();

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

  const handleNodeSelect = async () => {
    if (target === selectedResource) {
      return;
    }

    selectResource(target);
    selectNode(nodeId);
    updateResourceContext({
      selected_resource_context: resource_context,
    });

    // Fetch threads based on project and target, then select the latest thread
    try {
      const threads = await getThreads(selectedProject, target);
      if (threads && threads.length > 0) {
        // Threads are already in desc order, so select the first one (latest)
        const latestThread = threads[0];

        // Select the latest thread
        selectThread(latestThread.thread_id);

        // Set messages from the latest thread
        const threadMessages = (latestThread.values as any)?.messages;
        if (Array.isArray(threadMessages)) {
          setMessages(threadMessages);
        } else {
          setMessages([]);
        }

        // Update threads list
        setThreads(threads);
      } else {
        // No threads found, create a new thread and select it
        createNewThread.mutate(undefined, {
          onSuccess: (data: any) => {
            if (data?.thread_id) {
              selectThread(data.thread_id);
              setMessages([]); // Clear messages for new thread
              // Refresh threads list to include the new thread
              getThreads(selectedProject, target).then((updatedThreads) => {
                setThreads(updatedThreads);
              });
            }
          },
          onError: (error: any) => {
            console.error("Failed to create new thread:", error);
            setMessages([]);
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch threads for node select:", error);
      setMessages([]);
    }

    openSidebarChat();
    onSuccess?.();
  };

  return {
    nodeId,
    handleNodeSelect,
    updateThreadState,
  };
};
