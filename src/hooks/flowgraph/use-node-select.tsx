import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import {
  useProjectActions,
  useProjectState,
} from "@/contexts/project/project-context";
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
import _ from "lodash";

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
  const { selectThread, enableSidebarLoading, disableSidebarLoading } = useChatActions();
  const { sidebarChatResponding } = useChatState();
  const { setMessages } = useCopilotChatHeadless_c();
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const createChatMutation = useCreateNewChatSessionMutation(target);
  const threadData = useLatestThread({ target });

  if (!target) {
    return {
      handleNodeSelect: () => {},
    };
  }

  const nodeId = `${target.resourceType.toLowerCase()}-${target.name}`;

  const handleNodeSelect = () => {
    if (sidebarChatResponding) {
      toast.info("Agent is responding, please wait...");
      return;
    }

    selectResource(target);
    selectNode(nodeId);

    if (messageType) {
      // Set loading to true when starting the process
      enableSidebarLoading();
      
      // Reset messages if the selected resource equals the target
      const shouldResetMessages = !_.isEqual(selectedResource, target);
      if (shouldResetMessages) setMessages([]);

      createChatMutation.mutate(undefined, {
        onSuccess: (thread) => {
          selectThread(thread.thread_id);
          appendSystemMessage({
            type: messageType,
            target,
            payload,
            onSuccess: () => {
              // Set loading to false when appendSystemMessage is triggered
              disableSidebarLoading();
              onSuccess?.();
            },
            resetMessages: shouldResetMessages,
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
