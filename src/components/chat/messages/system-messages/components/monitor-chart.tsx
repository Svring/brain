import React from "react";
import { CombinedMetricsChart } from "@/components/chat/messages/system-messages/components/combined-metrics-chart";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface MonitorChartProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const MonitorChart: React.FC<MonitorChartProps> = ({ target }) => {
  const { monitorData, isLoading } = useResourceMetricsStatus({
    target,
  });

  return (
    <div className="border rounded-lg p-4">
      <CombinedMetricsChart data={monitorData || []} isLoading={isLoading} />
    </div>
  );
};

export default MonitorChart;
