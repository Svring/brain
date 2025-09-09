import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import { useProjectActions } from "@/contexts/project/project-context";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useChatActions, useChatState } from "@/contexts/chat/chat-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useLatestThread } from "@/hooks/langgraph/use-latest-thread";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { toast } from "sonner";

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
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const { selectThread } = useChatActions();
  const { sidebarChatResponding } = useChatState();

  // Create new chat session mutation
  const createChatMutation = useCreateNewChatSessionMutation(target);

  // Construct node ID based on target
  const nodeId = `${target.resourceType.toLowerCase()}-${target.name}`;

  // Get latest thread and its state
  const {
    threads,
    threadsLoading,
    latestThreadId,
    latestThreadState,
    threadStateLoading,
    hasThreads,
  } = useLatestThread({ target });

  // console.log("sidebarChatResponding", sidebarChatResponding);

  const handleNodeSelect = () => {
    // Select the resource in project context
    selectResource(target);

    // Select and focus the node in flowgraph context
    selectNode(nodeId);
    // focusNode(nodeId);

    // Simply append the message if messageType is provided
    if (messageType) {
      // Don't trigger createChatMutation if chat is already responding
      if (sidebarChatResponding) {
        toast("Agent is responding, please wait...");
        return;
      }

      createChatMutation.mutate(undefined, {
        onSuccess: (thread) => {
          // Select the newly created thread
          selectThread(thread.thread_id);

          // Handle message appending if messageType is provided
          if (messageType) {
            appendSystemMessage({
              type: messageType,
              target,
              payload,
              onSuccess,
            });
          }
        },
      });
    }
  };

  return {
    nodeId,
    handleNodeSelect,
    threads,
    threadsLoading,
    latestThreadId,
    latestThreadState,
    threadStateLoading,
    hasThreads,
    createChatMutation,
  };
};
