import React from "react";
import { CombinedMetricsChart } from "../components/combined-metrics-chart";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { BaseSystemMessage } from "../components/base-system-message";
import { useAppendMessagesMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { ArrowBigUpDash } from "lucide-react";
import { MessageAction } from "../components/message-actions";

interface CombinedMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const MonitorMessage: React.FC<CombinedMessageProps> = ({ target }) => {
  const { monitorData, isLoading, status, color } = useResourceMetricsStatus({
    target,
  });

  const appendMessagesMutation = useAppendMessagesMutation();

  const handleUpdateResourceQuota = () => {
    appendMessagesMutation.mutate([
      {
        role: "system",
        content: {
          type: "manage.resourceQuotaUpdate",
          payload: target,
        },
      },
    ]);
  };

  const actions: MessageAction[] = [
    {
      icon: ArrowBigUpDash,
      label: "Update Resource Quota",
      onClick: handleUpdateResourceQuota,
    },
  ];

  return (
    <BaseSystemMessage
      target={target}
      actions={actions}
    >
      <div className="border rounded-lg p-4">
        <CombinedMetricsChart data={monitorData || []} isLoading={isLoading} />
      </div>
    </BaseSystemMessage>
  );
};

export default MonitorMessage;
