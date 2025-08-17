import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { ClusterInfoHeader } from "./cluster-info-header";
import { MetricsMonitor } from "@/components/chat/messages/components/metrics-monitor";
import { ClusterInfoConnection } from "./cluster-info-connection";
import { ClusterInfoActions } from "./cluster-info-actions";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { 
  getClusterOptions, 
  getClusterRangedMonitorOptions 
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { createK8sContext, createMetricsContext } from "@/lib/auth/auth-utils";

interface ClusterInfoMessageProps {
  payload: ClusterObject | CustomResourceTarget;
}

export const ClusterInfoMessage: React.FC<ClusterInfoMessageProps> = ({
  payload,
}) => {
  const k8sContext = createK8sContext();
  const metricsContext = createMetricsContext('cluster');
  
  // Check if payload is a target or cluster object
  const isTarget = 'name' in payload && 'group' in payload && 'version' in payload;
  
  // If it's a target, fetch the cluster data
  const { data: clusterData } = useQuery(
    isTarget 
      ? getClusterOptions(k8sContext, payload as CustomResourceTarget)
      : { queryKey: ['cluster-data'], queryFn: () => payload as ClusterObject }
  );

  // Fetch cluster monitoring data
  const { data: monitorData, isLoading: isMonitorLoading } = useQuery(
    getClusterRangedMonitorOptions(
      metricsContext, 
      clusterData?.name || "", 
      clusterData?.type || ""
    )
  );

  // Use the fetched data or fallback to the original payload
  const finalData = clusterData || (isTarget ? null : payload as ClusterObject);

  if (!finalData) {
    return (
      <Card className="w-full bg-background-secondary">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading cluster information...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-background-secondary">
      <ClusterInfoHeader clusterData={finalData} />
      <CardContent className="space-y-4">
        <MetricsMonitor 
          resource={finalData.resource}
          monitorData={monitorData}
          isMonitorLoading={isMonitorLoading}
        />
        <ClusterInfoConnection clusterData={finalData} />
      </CardContent>
      <ClusterInfoActions clusterData={finalData} />
    </Card>
  );
};

export default ClusterInfoMessage;
