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
import { Save, FileText, Container, BarChart3 } from "lucide-react";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface ClusterInfoMessageProps {
  payload: CustomResourceTarget;
}

export const ClusterInfoMessage: React.FC<ClusterInfoMessageProps> = ({
  payload,
}) => {
  const clusterTrpcClient = clusterClient.useTRPC();
  const { sendSystemMessage: emitMessage } = useSendSystemMessageMutation();

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

  const handleBackupClick = () => {
    emitMessage({
      type: "info.clusterBackup",
      payload: {
        clusterName: clusterData?.name || "",
      },
    });
  };

  const handlePodsClick = () => {
    emitMessage({
      type: "podOverview",
      payload: payload,
    });
  };

  const handleViewMetricsClick = () => {
    emitMessage({
      type: "monitor",
      payload: payload,
    });
  };

  const handleLogsClick = () => {
    emitMessage({
      type: "resourceLog",
      payload: payload,
    });
  };

  const actions: MessageAction[] = clusterData
    ? [
        {
          icon: Save,
          label: "Backup",
          onClick: handleBackupClick,
        },
        {
          icon: FileText,
          label: "Logs",
          onClick: handleLogsClick,
        },
        {
          icon: Container,
          label: "Pods",
          onClick: handlePodsClick,
        },
        {
          icon: BarChart3,
          label: "View Metrics",
          onClick: handleViewMetricsClick,
        },
      ]
    : [];

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={payload}>
        <Card className="w-full bg-node-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <span className="text-muted-foreground">
                Loading cluster information...
              </span>
            </div>
          </CardContent>
        </Card>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !clusterData) {
    return (
      <BaseSystemMessage target={payload}>
        <Card className="w-full bg-node-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <span className="text-destructive">
                Failed to load cluster information
              </span>
            </div>
          </CardContent>
        </Card>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage target={payload} actions={actions}>
      <Card className="w-full bg-node-background">
        <ClusterInfoHeader clusterData={clusterData} />
        <CardContent className="space-y-4">
          <ResourceQuotaRow
            cpu={clusterData.resource?.cpu}
            memory={clusterData.resource?.memory}
            storage={clusterData.resource?.storage}
          />
          <ClusterInfoConnection clusterData={clusterData} />
        </CardContent>
      </Card>
    </BaseSystemMessage>
  );
};

export default ClusterInfoMessage;
