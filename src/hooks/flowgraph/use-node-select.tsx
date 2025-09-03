import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import { useProjectActions } from "@/contexts/project/project-context";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

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
  const { selectNode, focusNode } = useFlowgraphActions();
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  // Construct node ID based on target
  const nodeId = `${target.resourceType.toLowerCase()}-${target.name}`;

  const handleNodeSelect = () => {
    // Select the resource in project context
    selectResource(target);
    
    // Select and focus the node in flowgraph context
    selectNode(nodeId);
    focusNode(nodeId);

    // Handle message appending if messageType is provided
    if (messageType) {
      appendSystemMessage({
        type: messageType,
        target,
        payload,
        onSuccess,
      });
    }
  };

  return {
    nodeId,
    handleNodeSelect,
  };
};
