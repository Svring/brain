import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { devboxClient } from "@/components/provider/trpc-provider";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import {
  GitBranch,
  BarChart3,
  Pencil,
  ArrowBigUpDash,
  History,
  Globe,
} from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { DevboxMessageDetail } from "./components/devbox-message-details";
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
  } = useQuery(devboxTrpcClient.get.queryOptions(target));

  const actions: MessageAction[] = devboxObject
    ? [
        {
          icon: ArrowBigUpDash,
          label: "Release and Deploy",
          onClick: () => {
            appendSystemMessage({ type: "devbox.createRelease", target });
          },
        },
        {
          icon: History,
          label: "Release History",
          onClick: () => {
            appendSystemMessage({ type: "devbox.release", target });
          },
        },
        {
          icon: Globe,
          label: "Network Status",
          onClick: () => {
            appendSystemMessage({ type: "devbox.network", target });
          },
        },
      ]
    : [];

  // Show loading state
  if (isLoading) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading devbox information...
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Show error state
  if (error || !devboxObject) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load devbox information
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  return (
    <BaseResourceMessage
      target={target}
      actions={actions}
      headerSlot={
        <div className="flex items-center gap-2">
          <DevboxNodeIde object={devboxObject} />
          <DevboxMessageMenu target={target} />
        </div>
      }
    >
      <DevboxMessageDetail target={target} />
    </BaseResourceMessage>
  );
};

export default DevboxMessage;
