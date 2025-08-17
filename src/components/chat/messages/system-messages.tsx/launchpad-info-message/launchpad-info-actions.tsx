import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Container } from "lucide-react";
import { useEmitSystemMessage } from "@/lib/copilot/message/message-utils";

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
  const { emitMessage } = useEmitSystemMessage();

  const handleLogsClick = () => {
    emitMessage(`Fetching logs for your ${kind} "${name}"...`, {
      type: "info.logs",
      payload: {
        resourceName: name,
        resourceType: kind,
        resource: resource,
      },
    });
  };

  const handlePodClick = () => {
    emitMessage(`Displaying pods for your ${kind} "${name}":`, {
      type: "info.pod",
      payload: {
        pods: [], // This will be populated by the system
        resourceName: name,
        resourceType: kind,
      },
    });
  };

  return (
    <div className="flex gap-3 px-6 pb-6">
      <Button
        className="flex-1"
        variant="outline"
        onClick={handleLogsClick}
      >
        <FileText className="w-4 h-4 mr-2" />
        Logs
      </Button>
      <Button className="flex-1" variant="outline" onClick={handlePodClick}>
        <Container className="w-4 h-4 mr-2" />
        Pods
      </Button>
    </div>
  );
};
