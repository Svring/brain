import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import {
  useProjectActions,
  useProjectState,
} from "@/contexts/project/project-context";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useChatActions } from "@/contexts/chat/chat-context";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useLanggraphActions } from "@/contexts/langgraph/langgraph-context";

interface UseNodeSelectParams {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const useNodeSelect = ({ target }: UseNodeSelectParams) => {
  const { selectResource } = useProjectActions();
  const { selectNode } = useFlowgraphActions();
  const { openChat } = useChatActions();
  const { updateResourceContext } = useLanggraphActions();
  const { selectedResource } = useProjectState();

  // Get resource status for the target
  const { resource: resource_context } = useResourceStatus(target);

  const nodeId = `${target.resourceType.toLowerCase()}-${target.name}`;

  const handleNodeSelect = (): void => {
    if (target === selectedResource) {
      return;
    }

    selectResource(target);
    selectNode(nodeId);
    updateResourceContext({
      selected_resource_context: resource_context,
    });

    // Open chat for this resource target
    openChat(target);
  };

  return {
    nodeId,
    handleNodeSelect,
  };
};
