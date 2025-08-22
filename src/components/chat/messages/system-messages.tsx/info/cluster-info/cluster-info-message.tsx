import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClusterInfoHeader } from "./cluster-info-header";
import { ResourceQuotaRow } from "@/components/chat/messages/components/resource-quota-row";
import { ClusterInfoConnection } from "./cluster-info-connection";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { clusterClient } from "@/components/provider/trpc-provider";
import { BaseSystemMessage } from "@/components/chat/messages/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/components/message-actions";
import {
  Save,
  FileText,
  Container,
  BarChart3,
  EthernetPort,
} from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ClusterInfoDetails } from "./cluster-info-details";

interface ClusterInfoMessageProps {
  payload: CustomResourceTarget;
}

export const ClusterInfoMessage: React.FC<ClusterInfoMessageProps> = ({
  payload,
}) => {
  const clusterTrpcClient = clusterClient.useTRPC();
  const { sendSystemMessage: emitMessage } = useAppendSystemMessageMutation();

  // Fetch the cluster data using the target
  const {
    data: clusterData,
    isLoading,
    error,
  } = useQuery(
    clusterTrpcClient.getCluster.queryOptions({
      target: payload,
    })
  );

  const actions: MessageAction[] = clusterData
    ? [
        {
          icon: Save,
          label: "Backup",
          onClick: () => {
            emitMessage({
              type: "info.clusterBackup",
              payload: {
                clusterName: clusterData?.name || "",
              },
            });
          },
        },
        {
          icon: BarChart3,
          label: "View Metrics",
          onClick: () => {
            emitMessage({
              type: "info.monitor",
              payload: payload,
            });
          },
        },
        {
          icon: EthernetPort,
          label: "View Connection",
          onClick: () => {
            emitMessage({
              type: "info.clusterConnection",
              payload: payload,
            });
          },
        },
      ]
    : [];

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={payload}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading cluster information...
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !clusterData) {
    return (
      <BaseSystemMessage target={payload}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load cluster information
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage target={payload} actions={actions}>
      <ClusterInfoDetails clusterData={clusterData} />
    </BaseSystemMessage>
  );
};

export default ClusterInfoMessage;
