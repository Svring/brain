import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Container, BarChart3 } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

interface LaunchpadInfoActionsProps {
  name: string;
  kind: string;
  resource: any;
}

export const LaunchpadInfoActions: React.FC<LaunchpadInfoActionsProps> = ({
  name,
  kind,
  resource,
}) => {
  const { sendSystemMessage: emitMessage } = useAppendSystemMessageMutation();

  const handleLogsClick = () => {
    emitMessage({
      type: "info.logs",
      payload: {
        resourceName: name,
        resourceType: kind,
        resource: resource,
      },
    });
  };

  const handlePodClick = () => {
    emitMessage({
      type: "info.pod",
      payload: {
        pods: [], // This will be populated by the system
        resourceName: name,
        resourceType: kind,
      },
    });
  };

  const handleViewMetricsClick = () => {
    emitMessage({
      type: "info.combinedMetrics",
      payload: {
        name: resource.name,
        kind: resource.kind,
        pods: resource.pods,
      },
    });
  };

  return (
    <div className="flex gap-3 px-6 pb-6">
      <Button className="flex-1" variant="outline" onClick={handleLogsClick}>
        <FileText className="w-4 h-4 mr-2" />
        Logs
      </Button>
      <Button className="flex-1" variant="outline" onClick={handlePodClick}>
        <Container className="w-4 h-4 mr-2" />
        Pods
      </Button>
      <Button className="flex-1" variant="outline" onClick={handleViewMetricsClick}>
        <BarChart3 className="w-4 h-4 mr-2" />
        Metrics
      </Button>
    </div>
  );
};
