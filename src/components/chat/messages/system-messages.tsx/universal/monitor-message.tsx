import React from "react";
import { CombinedMetricsChart } from "@/components/chat/messages/system-messages.tsx/components/combined-metrics-chart";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { ArrowBigUpDash } from "lucide-react";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/message-actions";

interface MonitorMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const MonitorMessage: React.FC<MonitorMessageProps> = ({ target }) => {
  const { monitorData, isLoading } = useResourceMetricsStatus({
    target,
  });

  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const actions: MessageAction[] = [
    {
      icon: ArrowBigUpDash,
      label: "Update Resource Quota",
      onClick: () => appendSystemMessage("manage.resourceQuotaUpdate", target),
    },
  ];

  return (
    <BaseSystemMessage target={target} actions={actions}>
      <div className="border rounded-lg p-4">
        <CombinedMetricsChart data={monitorData || []} isLoading={isLoading} />
      </div>
    </BaseSystemMessage>
  );
};

export default MonitorMessage;
