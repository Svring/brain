import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import {
  useProjectActions,
  useProjectState,
} from "@/contexts/project/project-context";
import {
  useCreateNewChatSessionMutation,
  useSendMessageMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import type { PendingMessage } from "@/contexts/chat/chat-machine";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { toast } from "sonner";
import _ from "lodash";
import { useThreads } from "@/hooks/langgraph/use-threads";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useLanggraphActions } from "@/contexts/langgraph/langgraph-context";

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
  const { selectedResource } = useProjectState();
  const { selectNode } = useFlowgraphActions();
  const {
    selectThread,
    enableSidebarLoading,
    disableSidebarLoading,
    openSidebarChat,
    setPendingMessage,
  } = useChatActions();
  const { updateResourceContext } = useLanggraphActions();

  // Get resource status for the target
  const { resource: resource_context } = useResourceStatus(target);

  if (!target) {
    return {
      handleNodeSelect: () => {},
    };
  }

  const nodeId = `${target.resourceType.toLowerCase()}-${target.name}`;

  const handleNodeSelect = (type?: "append" | "send") => {
    selectResource(target);
    selectNode(nodeId);
    openSidebarChat();

    // Update resource context with the resource status
    updateResourceContext({
      selected_resource_context: resource_context,
    });

    // If messageType is provided, set a pending message
    if (messageType) {
      const pendingMessage: PendingMessage = {
        timestamp: new Date(),
        type: type || "append", // Use type or default to append
        messageType,
        target,
        payload,
      };
      setPendingMessage(pendingMessage);
    }

    // Execute onSuccess callback if provided
    onSuccess?.();
  };

  return {
    nodeId,
    handleNodeSelect,
  };
};
