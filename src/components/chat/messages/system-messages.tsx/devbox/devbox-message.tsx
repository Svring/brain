import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { devboxClient } from "@/components/provider/trpc-provider";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/message-actions";
import { GitBranch, BarChart3, Pencil } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { DevboxInfoDetails } from "./components/devbox-message-details";
import DevboxMessageMenu from "./components/devbox-message-menu";

interface DevboxMessageProps {
  target: CustomResourceTarget;
}

export const DevboxMessage: React.FC<DevboxMessageProps> = ({ target }) => {
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const devboxTrpcClient = devboxClient.useTRPC();

  const {
    data: devboxObject,
    isLoading,
    error,
  } = useQuery(
    devboxTrpcClient.getDevbox.queryOptions({
      target,
    })
  );

  const actions: MessageAction[] = devboxObject
    ? [
        {
          icon: Pencil,
          label: "Update",
          onClick: () => {
            appendSystemMessage("devbox.update", target);
          },
        },
        {
          icon: GitBranch,
          label: "Releases",
          onClick: () => {
            appendSystemMessage("devbox.release", target);
          },
        },
        {
          icon: BarChart3,
          label: "View Metrics",
          onClick: () => {
            appendSystemMessage("universal.monitor", target);
          },
        },
      ]
    : [];

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading devbox information...
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !devboxObject) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load devbox information
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage 
      target={target} 
      actions={actions}
      headerSlot={<DevboxMessageMenu target={target} />}
    >
      <DevboxInfoDetails devboxObject={devboxObject} />
    </BaseSystemMessage>
  );
};

export default DevboxMessage;
