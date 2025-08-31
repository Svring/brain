import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { devboxClient } from "@/components/provider/trpc-provider";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import {
  GitBranch,
  BarChart3,
  Pencil,
  ArrowBigUpDash,
  History,
} from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { DevboxInfoDetails } from "./components/devbox-message-details";
import DevboxMessageMenu from "./components/devbox-message-menu";
import DevboxNodeIde from "@/components/flowgraph/node/sealos/devbox/devbox-node-ide";

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
          icon: ArrowBigUpDash,
          label: "Release and Deploy",
          onClick: () => {
            appendSystemMessage("devbox.createRelease", target);
          },
        },
        {
          icon: History,
          label: "Release History",
          onClick: () => {
            appendSystemMessage("devbox.release", target);
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
      prompt="You could update the devbox, view releases, and create a new release."
      actions={actions}
      headerSlot={
        <div className="flex items-center gap-2">
          <DevboxNodeIde object={devboxObject} />
          <DevboxMessageMenu target={target} />
        </div>
      }
    >
      <DevboxInfoDetails target={target} />
    </BaseSystemMessage>
  );
};

export default DevboxMessage;
