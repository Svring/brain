import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import { useProjectActions } from "@/contexts/project/project-context";
import {
  useAppendSystemMessageMutation,
  useCreateNewChatSessionMutation,
} from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useLatestThread } from "@/hooks/langgraph/use-latest-thread";
import { toast } from "sonner";

interface UseNodeSelectParams {
  target: CustomResourceTarget | BuiltinResourceTarget;
  messageType?: string;
  payload?: unknown;
  onSuccess?: () => void;
  resetMessages?: boolean;
}

export const useNodeSelect = ({
  target,
  messageType,
  payload,
  onSuccess,
  resetMessages,
}: UseNodeSelectParams) => {
  const { selectResource } = useProjectActions();
  const { selectNode } = useFlowgraphActions();
  const { selectThread } = useChatActions();
  const { sidebarChatResponding } = useChatState();
  const { setMessages } = useCopilotChatHeadless_c();
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const createChatMutation = useCreateNewChatSessionMutation(target);
  const threadData = useLatestThread({ target });

  const nodeId = `${target.resourceType.toLowerCase()}-${target.name}`;

  const handleNodeSelect = () => {
    if (sidebarChatResponding) {
      toast.info("Agent is responding, please wait...");
      return;
    }

    selectResource(target);
    selectNode(nodeId);

    if (messageType) {
      if (resetMessages) setMessages([]);

      createChatMutation.mutate(undefined, {
        onSuccess: (thread) => {
          selectThread(thread.thread_id);
          appendSystemMessage({
            type: messageType,
            target,
            payload,
            onSuccess,
            resetMessages,
          });
        },
      });
    }
  };

  return {
    nodeId,
    handleNodeSelect,
    ...threadData,
    createChatMutation,
  };
};
