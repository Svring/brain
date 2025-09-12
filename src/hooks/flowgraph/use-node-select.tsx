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
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { toast } from "sonner";
import _ from "lodash";
import { useResourceThreads } from "@/hooks/langgraph/use-resource-thread";
import { convertThreadToCopilotKitMessages } from "@/lib/langgraph/langgraph-method/langgraph-utils";

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
  } = useChatActions();
  const { sidebarChatResponding } = useChatState();
  const { setMessages } = useCopilotChatHeadless_c();
  const createChatMutation = useCreateNewChatSessionMutation(target);

  // Use resource threads to get the latest thread
  const { latestThread, latestThreadId, threadsLoading } = useResourceThreads();

  console.log("latestThread", latestThread);

  if (!target) {
    return {
      handleNodeSelect: () => {},
    };
  }

  const nodeId = `${target.resourceType.toLowerCase()}-${target.name}`;

  const handleNodeSelect = () => {
    // if (sidebarChatResponding) {
    //   toast.info("Agent is responding, please wait...");
    //   return;
    // }

    selectResource(target);
    selectNode(nodeId);

    if (latestThreadId) {
      selectThread(latestThreadId);
      openSidebarChat();
    }
  };

  return {
    nodeId,
    handleNodeSelect,
  };
};
