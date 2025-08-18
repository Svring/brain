import React from "react";
import { CombinedMetricsChart } from "../components/combined-metrics-chart";
import { useResourceMetrics } from "@/hooks/sealos/use-resource-metrics";

interface MetricsDataPoint {
  timestamp: number;
  readableTime: string;
  cpu: number;
  memory: number;
  storage?: number;
}

interface CombinedMessageProps {
  resource: {
    name: string;
    kind: string;
    type?: string;
    pods?: Array<{ name: string }>;
  };
  height?: string;
}

export const CombinedMessage: React.FC<CombinedMessageProps> = ({
  resource,
  height = "h-80",
}) => {
  const { monitorData, isLoading } = useResourceMetrics(resource);

  return (
    <div className="space-y-4 bg-node-background border border-border-primary rounded-xl p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {resource.kind} Metrics: {resource.name}
        </h3>
      </div>

      <div className="border rounded-lg p-4">
        <CombinedMetricsChart
          data={monitorData || []}
          isLoading={isLoading}
          height={height}
        />
      </div>
    </div>
  );
};

export default CombinedMessage;
