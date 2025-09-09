import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { clusterClient } from "@/components/provider/trpc-provider";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { EthernetPort, Pencil } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import ClusterMessageDetails from "./components/cluster-message-details";
import ClusterMessageMenu from "./components/cluster-message-menu";

interface ClusterMessageProps {
  target: CustomResourceTarget;
}

export const ClusterMessage: React.FC<ClusterMessageProps> = ({ target }) => {
  const clusterTrpcClient = clusterClient.useTRPC();
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  // Fetch the cluster data using the target
  const {
    data: clusterObject,
    isLoading,
    error,
  } = useQuery(clusterTrpcClient.getCluster.queryOptions(target));

  const actions: MessageAction[] = clusterObject
    ? [
        {
          icon: EthernetPort,
          label: "View Connection",
          onClick: () => {
            appendSystemMessage({ type: "cluster.connection", target });
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
            Loading cluster information...
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Show error state
  if (error || !clusterObject) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load cluster information
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  return (
    <BaseResourceMessage
      target={target}
      actions={actions}
      headerSlot={<ClusterMessageMenu target={target} />}
    >
      <ClusterMessageDetails target={target} />
    </BaseResourceMessage>
  );
};

export default ClusterMessage;
