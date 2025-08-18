import React from "react";
import { Button } from "@/components/ui/button";
import { Save, FileText, Container, BarChart3 } from "lucide-react";
import { useEmitSystemMessage } from "@/lib/copilot/message/message-utils";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

interface ClusterInfoActionsProps {
  clusterData: ClusterObject;
}

export const ClusterInfoActions: React.FC<ClusterInfoActionsProps> = ({
  clusterData,
}) => {
  const { emitMessage } = useEmitSystemMessage();

  const handleBackupClick = () => {
    emitMessage({
      type: "info.clusterBackup",
      payload: {
        clusterName: clusterData.name,
        backups: [], // The system will fetch and populate this
      },
    });
  };

  const handlePodsClick = () => {
    emitMessage({
      type: "info.pod",
      payload: {
        pods: clusterData.pods || [],
        resourceName: clusterData.name,
        resourceType: clusterData.type,
      },
    });
  };

  const handleViewMetricsClick = () => {
    emitMessage({
      type: "info.clusterMetrics",
      payload: {
        clusterName: clusterData.name,
        clusterType: clusterData.type,
        target: {
          name: clusterData.name,
          type: clusterData.type,
        },
      },
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
      <Button className="flex-1" variant="outline" size="sm">
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
