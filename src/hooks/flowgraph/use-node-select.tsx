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
  const { updateThreadState, threads, selectThread, createNewThread } =
    useThreads();
  const { selectedResource, selectedProject } = useProjectState();
  const { submitWithContext } = useStreamContext();

  // Get resource status for the target
  const { resource: resource_context } = useResourceStatus(target);

  if (!target) {
    console.log("[useNodeSelect] No target provided");
    return {
      handleNodeSelect: () => {},
    };
  }

  const nodeId = `${target.resourceType?.toLowerCase() || "unknown"}-${
    target.name || ""
  }`;

  const handleNodeSelect = async () => {
    console.log("[useNodeSelect] handleNodeSelect called with target:", target);

    if (target === selectedResource) {
      console.log("[useNodeSelect] Target is already the selected resource. No action taken.");
      return;
    }

    console.log("[useNodeSelect] Selecting resource:", target);
    selectResource(target);

    console.log("[useNodeSelect] Selecting node with nodeId:", nodeId);
    selectNode(nodeId);

    console.log("[useNodeSelect] Updating resource context with:", resource_context);
    updateResourceContext({
      selected_resource_context: resource_context,
    });

    // Find thread with matching resourceTarget in metadata
    const matchingThread = threads.find((thread) => {
      const metadata = thread.metadata;
      if (metadata?.resourceTarget) {
        return metadata.resourceTarget === JSON.stringify(target);
      }
      return false;
    });

    if (matchingThread) {
      console.log("[useNodeSelect] Found matching thread:", matchingThread.thread_id, "Selecting thread.");
      // Select the matching thread
      selectThread(matchingThread.thread_id);
    } else {
      console.log("[useNodeSelect] No matching thread found. Creating a new thread.");
      // No matching thread found, create a new thread and select it
      createNewThread.mutate(undefined, {
        onSuccess: (data: Thread) => {
          if (data?.thread_id) {
            console.log("[useNodeSelect] New thread created with thread_id:", data.thread_id, "Selecting thread.");
            selectThread(data.thread_id);
          } else {
            console.warn("[useNodeSelect] New thread created but no thread_id found in data:", data);
          }
        },
        onError: (error: any) => {
          console.error("[useNodeSelect] Failed to create new thread:", error);
        },
      });
    }

    // console.log(
    //   "[useNodeSelect] Submitting message with context:",
    //   messageType
    // );
    // if (messageType) {
    //   setTimeout(() => {
    //     submitWithContext({
    //       messages: [
    //         {
    //           type: "system",
    //           content: JSON.stringify({
    //             type: messageType,
    //             target,
    //           }),
    //         },
    //       ],
    //       stage: "append",
    //     });
    //   }, 1000);
    // }

    openSidebarChat();
    onSuccess?.();
  };

  return {
    nodeId,
    handleNodeSelect,
    updateThreadState,
  };
};
