import React from "react";
import { Button } from "@/components/ui/button";
import { GitBranch, BarChart3 } from "lucide-react";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

interface DevboxInfoActionsProps {
  devboxData: DevboxObject;
}

export const DevboxInfoActions: React.FC<DevboxInfoActionsProps> = ({
  devboxData,
}) => {
  const { sendSystemMessage: emitMessage } = useSendSystemMessageMutation();

  const handleReleasesClick = () => {
    emitMessage({
      type: "info.devboxRelease",
      payload: {
        devboxName: devboxData.name,
      },
    });
  };

  const handleViewMetricsClick = () => {
    emitMessage({
      type: "info.combinedMetrics",
      payload: {
        name: devboxData.name,
        kind: "devbox",
        pods: devboxData.pods,
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          View detailed information about releases and resource metrics
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          className="flex-1"
          variant="outline"
          onClick={handleReleasesClick}
        >
          <GitBranch className="w-4 h-4 mr-2" />
          Releases
        </Button>
        <Button
          className="flex-1"
          variant="outline"
          onClick={handleViewMetricsClick}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          View Metrics
        </Button>
      </div>
    </div>
  );
};
