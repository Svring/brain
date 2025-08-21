import React from "react";
import { CombinedMetricsChart } from "../components/combined-metrics-chart";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Badge } from "@/components/ui/badge";
import MessageHeader from "../components/message-header";
import { useAppendMessagesMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useOnceEffect } from "@/hooks/use-once-effect";

interface CombinedMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const MonitorMessage: React.FC<CombinedMessageProps> = ({ target }) => {
  const { monitorData, isLoading, status, color } = useResourceMetricsStatus({
    target,
  });

  const appendMessagesMutation = useAppendMessagesMutation();

  useOnceEffect(status ? status : null, (status) => {
    const messages = {
      low: "The resource usage is low, everything is good.",
      medium: "The resource usage is medium, consider monitoring closely.",
      high: "The resource usage is high, immediate attention may be required.",
    };

    const message = messages[status as keyof typeof messages];
    if (message) {
      appendMessagesMutation.mutate([
        {
          role: "assistant",
          content: message,
        },
      ]);
    }
  });

  return (
    <div className="space-y-4 bg-node-background border border-border-primary rounded-xl p-4">
      <div className="flex flex-col gap-2">
        <MessageHeader target={target} />
      </div>
      <div className="border rounded-lg p-4">
        <CombinedMetricsChart data={monitorData || []} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default MonitorMessage;
