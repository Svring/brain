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
import { useThreads } from "@/hooks/langgraph/use-threads";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
  useLanggraphActions,
  useLanggraphStream,
  useLanggraphState,
} from "@/contexts/langgraph/langgraph-context";

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
  const { openSidebarChat } = useChatActions();
  const { selectedThreadId } = useChatState();
  const { updateResourceContext } = useLanggraphActions();
  const { updateThreadState } = useThreads();
  const { submit } = useLanggraphStream();
  const { apiKey, baseUrl, modelName, stage, contextWindowUsage } =
    useLanggraphState();
  const { selectedProject, selectedProjectResources, selectedResourceContext } =
    useProjectState();

  // Get resource status for the target
  const { resource: resource_context } = useResourceStatus(target);

  if (!target) {
    return {
      handleNodeSelect: () => {},
    };
  }

  const nodeId = `${target.resourceType?.toLowerCase() || "unknown"}-${target.name || ""}`;

  const handleNodeSelect = () => {
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
