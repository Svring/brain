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
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-action-message";

interface MonitorMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const MonitorMessage: React.FC<MonitorMessageProps> = ({ target }) => {
  const { monitorData, isLoading } = useResourceMetricsStatus({
    target,
  });

  // console.log("monitorData", monitorData);

  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const handleUpdateResource = () => {
    const resourceType = target.resourceType.toLowerCase();
    if (resourceType === "deployment" || resourceType === "statefulset") {
              appendSystemMessage({ type: "launchpad.updateResource", target });
    }
  };

  const actions: MessageAction[] = [
    {
      icon: ArrowBigUpDash,
      label: "Update Resource Quota",
      onClick: handleUpdateResource,
      disabled: !["deployment", "statefulset"].includes(
        target.resourceType.toLowerCase()
      ),
    },
  ];

  return (
    <BaseActionMessage
      className="pb-4"
      headerTitle={{
        icon: BarChart3,
        name: "Resource Metrics",
      }}
      actions={actions}
    >
      <div className="border rounded-lg p-4">
        <CombinedMetricsChart data={monitorData || []} isLoading={isLoading} />
      </div>
    </BaseActionMessage>
  );
};

export default MonitorMessage;
