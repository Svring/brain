import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { ClusterInfoHeader } from "./cluster-info-header";
import { MetricRow } from "@/components/chat/messages/components/metric-row";
import { ResourceQuotaRow } from "@/components/chat/messages/components/resource-quota-row";
import { ClusterInfoConnection } from "./cluster-info-connection";
import { ClusterInfoActions } from "./cluster-info-actions";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { clusterClient } from "@/components/provider/trpc-provider";

interface ClusterInfoMessageProps {
  payload: CustomResourceTarget;
}

export const ClusterInfoMessage: React.FC<ClusterInfoMessageProps> = ({
  payload,
}) => {
  const clusterTrpcClient = clusterClient.useTRPC();

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

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full bg-background-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground">
              Loading cluster information...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error || !clusterData) {
    return (
      <Card className="w-full bg-background-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <span className="text-destructive">
              Failed to load cluster information
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-background-secondary">
      <ClusterInfoHeader clusterData={clusterData} />
      <CardContent className="space-y-4">
        <ResourceQuotaRow
          cpu={clusterData.resource?.cpu}
          memory={clusterData.resource?.memory}
          storage={clusterData.resource?.storage}
        />
        {/* <MetricRow metric="cpu" resource={clusterData.resource} monitorData={monitorData} isLoading={isMonitorLoading} />
        <MetricRow metric="memory" resource={clusterData.resource} monitorData={monitorData} isLoading={isMonitorLoading} />
        <MetricRow metric="storage" resource={clusterData.resource} monitorData={monitorData} isLoading={isMonitorLoading} /> */}
        <ClusterInfoConnection clusterData={clusterData} />
      </CardContent>
      <ClusterInfoActions clusterData={clusterData} />
    </Card>
  );
};

export default ClusterInfoMessage;
