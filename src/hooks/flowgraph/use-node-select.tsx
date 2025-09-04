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

// const queryClient = useQueryClient();
//   const { selectThread } = useChatActions();
//   const { reset } = useCopilotChatHeadless_c();
// onSuccess: (thread) => {
//   // Set the new thread ID in chat context
//   selectThread(thread.thread_id);
//   // Reset the chat headless state
//   reset();
//   // Invalidate and refetch threads list after creating a new thread
//   queryClient.invalidateQueries({
//     queryKey: ["langgraph", "threads", "list"],
//   });
// },

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
  const { selectThread } = useChatActions();
  const { auth } = useAuthState();
  const { selectedProject } = useProjectState();
  const { reset } = useCopilotChatHeadless_c();

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

  const handleNodeSelect = () => {
    // Select the resource in project context
    selectResource(target);

    // Select and focus the node in flowgraph context
    selectNode(nodeId);
    focusNode(nodeId);

    // Simply append the message if messageType is provided
    if (messageType) {
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
      // appendSystemMessage({
      //   type: messageType,
      //   target,
      //   payload,
      //   onSuccess,
      // });
    }

    // Commented out thread-related logic
    // // Check if threads exist and select the latest one, or create a new one
    // if (hasThreads && latestThreadId && false) {
    //   // Select the latest existing thread
    //   selectThread(latestThreadId);

    //   // Handle message appending if messageType is provided
    //   if (messageType) {
    //     appendSystemMessage({
    //       type: messageType,
    //       target,
    //       payload,
    //       onSuccess,
    //     });
    //   }
    // } else {
    //   // Create a new chat session
    // createChatMutation.mutate(undefined, {
    //   onSuccess: (thread) => {
    //     // Select the newly created thread
    //     selectThread(thread.thread_id);

    //     // Handle message appending if messageType is provided
    //     if (messageType) {
    //       appendSystemMessage({
    //         type: messageType,
    //         target,
    //         payload,
    //         onSuccess,
    //       });
    //     }
    //   },
    // });
    // }
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
