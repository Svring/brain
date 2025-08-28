import React, { useMemo } from "react";
import { CombinedMetricsChart } from "@/components/chat/messages/system-messages.tsx/components/combined-metrics-chart";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { ArrowBigUpDash, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonitorMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const MonitorMessage: React.FC<MonitorMessageProps> = ({ target }) => {
  const { monitorData, isLoading } = useResourceMetricsStatus({
    target,
  });

  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const handleUpdateResource = () => {
    const resourceType = target.resourceType.toLowerCase();
    if (resourceType === "deployment" || resourceType === "statefulset") {
      appendSystemMessage("launchpad.updateResource", target);
    }
  };

  return (
    <BaseActionMessage
      headerTitle={{
        icon: BarChart3,
        name: "Resource Metrics",
      }}
      headerSlot={
        <Button
          onClick={handleUpdateResource}
          size="sm"
          variant="outline"
          disabled={!["deployment", "statefulset"].includes(target.resourceType.toLowerCase())}
          className="flex items-center gap-2 border border-border-primary brightness-150"
        >
          <ArrowBigUpDash className="w-3 h-3 text-theme-blue" />
          Update Resource Quota
        </Button>
      }
    >
      <div className="border rounded-lg p-4">
        <CombinedMetricsChart data={monitorData || []} isLoading={isLoading} />
      </div>
    </BaseActionMessage>
  );
};

export default MonitorMessage;
