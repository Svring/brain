import React from "react";
import { Button } from "@/components/ui/button";
import { Save, FileText, Container, BarChart3 } from "lucide-react";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface ClusterInfoActionsProps {
  clusterData: ClusterObject;
}

export const ClusterInfoActions: React.FC<ClusterInfoActionsProps> = ({
  clusterData,
}) => {
  const { sendSystemMessage: emitMessage } = useSendSystemMessageMutation();

  const handleBackupClick = () => {
    emitMessage({
      type: "info.clusterBackup",
      payload: {
        clusterName: clusterData.name,
      },
    });
  };

  const handlePodsClick = () => {
    emitMessage({
      type: "info.podOverview",
      payload: clusterData,
    });
  };

  const handleViewMetricsClick = () => {
    emitMessage({
      type: "info.combinedMetrics",
      payload: {
        name: clusterData.name,
        kind: "cluster",
        type: clusterData.type,
      },
    });
  };

  const handleLogsClick = () => {
    const target = CustomResourceTargetSchema.parse(
      convertResourceTypeToTarget("cluster", clusterData.name)
    );
    
    emitMessage({
      type: "info.clusterLog",
      payload: target,
    });
  };

  return (
    <div className="flex gap-3 px-6 pb-6">
      <Button
        className="flex-1"
        variant="outline"
        size="sm"
        onClick={handleBackupClick}
      >
        <Save className="w-4 h-4 mr-2" />
        Backup
      </Button>
      <Button 
        className="flex-1" 
        variant="outline" 
        size="sm"
        onClick={handleLogsClick}
      >
        <FileText className="w-4 h-4 mr-2" />
        Logs
      </Button>
      <Button
        className="flex-1"
        variant="outline"
        size="sm"
        onClick={handlePodsClick}
      >
        <Container className="w-4 h-4 mr-2" />
        Pods
      </Button>
      <Button
        className="flex-1"
        variant="outline"
        size="sm"
        onClick={handleViewMetricsClick}
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        View Metrics
      </Button>
    </div>
  );
};
