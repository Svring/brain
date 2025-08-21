import React from "react";
import { CombinedMetricsChart } from "../components/combined-metrics-chart";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface CombinedMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const CombinedMessage: React.FC<CombinedMessageProps> = ({ target }) => {
  const { monitorData, isLoading } = useResourceMetricsStatus({ target });

  return (
    <div className="space-y-4 bg-node-background border border-border-primary rounded-xl p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {target.resourceType} Metrics: {target.name}
        </h3>
      </div>

      <div className="border rounded-lg p-4">
        <CombinedMetricsChart data={monitorData || []} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default CombinedMessage;
