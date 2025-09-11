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
import { toast } from "sonner";
import _ from "lodash";
import { useResourceThreads } from "@/hooks/langgraph/use-resource-thread";
import { extractLanggraphMessages, convertToCopilotKitMessages } from "@/lib/langgraph/langgraph-method/langgraph-utils";
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
  const { selectThread, enableSidebarLoading, disableSidebarLoading, openSidebarChat } =
    useChatActions();
  const { sidebarChatResponding } = useChatState();
  const { setMessages } = useCopilotChatHeadless_c();
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const createChatMutation = useCreateNewChatSessionMutation(target);
  const { setConfig } = useLanggraphActions();
  
  // Use resource threads to get the latest thread
  const { threads, threadsLoading } = useResourceThreads();
  // const threadData = useLatestThread({ target });

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

      // Standard process: Load/Create thread first
      const ensureThreadExists = () => {
        if (threads && threads.length > 0) {
          // Thread exists, select it with langgraph action
          const latestThread = threads[0];
          selectThread(latestThread.thread_id);
          
          // Load messages from latest thread
          const extractedMessages = extractLanggraphMessages(latestThread);
          const convertedMessages = convertToCopilotKitMessages(extractedMessages);
          setMessages(convertedMessages);
          
          // Proceed to append system message
          appendSystemMessage({
            type: messageType,
            target,
            payload,
            onSuccess: () => {
              disableSidebarLoading();
              onSuccess?.();
            },
            resetMessages: false,
          });
        } else {
          // No thread exists, create one first
          createChatMutation.mutate(undefined, {
            onSuccess: (newThread) => {
              // Select the new thread with langgraph action
              selectThread(newThread.thread_id);
              
              // Proceed to append system message
              appendSystemMessage({
                type: messageType,
                target,
                payload,
                onSuccess: () => {
                  disableSidebarLoading();
                  onSuccess?.();
                },
                resetMessages: true,
              });
            },
            onError: () => {
              disableSidebarLoading();
            },
          });
        }
      };

      // Wait for threads to load if necessary
      if (threadsLoading) {
        setTimeout(ensureThreadExists, 100);
      } else {
        ensureThreadExists();
      }
    }
  };

  return {
    nodeId,
    handleNodeSelect,
    createChatMutation,
    // ...threadData,
  };
};
