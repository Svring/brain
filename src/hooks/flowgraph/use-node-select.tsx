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
  const { updateThreadState } = useThreads();
  const { selectedResource } = useProjectState();

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

  const handleNodeSelect = () => {
    if (target === selectedResource) {
      return;
    }

    selectResource(target);
    selectNode(nodeId);
    updateResourceContext({
      selected_resource_context: resource_context,
    });

    openSidebarChat();
    onSuccess?.();
  };

  return {
    nodeId,
    handleNodeSelect,
    updateThreadState,
  };
};
