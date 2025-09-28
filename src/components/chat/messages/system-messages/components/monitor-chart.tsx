import React from "react";
import { CombinedMetricsChart } from "@/components/chat/messages/system-messages/components/combined-metrics-chart";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface MonitorChartProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
  payload?: any;
}

export const MonitorChart: React.FC<MonitorChartProps> = ({ target, payload }) => {
  // Use payload data if available, otherwise fetch data
  const shouldFetchData = !payload;
  
  const { monitorData, isLoading } = useResourceMetricsStatus({
    target,
  });

  // Use payload data if available, otherwise use fetched data
  const chartData = payload || monitorData || [];
  const chartLoading = shouldFetchData ? isLoading : false;

  return (
    <div className="border rounded-lg p-4">
      <CombinedMetricsChart data={chartData} isLoading={chartLoading} />
    </div>
  );
};

export default MonitorChart;
