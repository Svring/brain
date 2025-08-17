import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Card, CardContent } from "@/components/ui/card";
import { createK8sContext } from "@/lib/auth/auth-utils";
import {
  getDevboxRangedMonitorOptions,
} from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import { useQuery } from "@tanstack/react-query";
import { createMetricsContext } from "@/lib/auth/auth-utils";
import { devboxClient } from "@/components/provider/trpc-provider";
import { DevboxInfoHeader } from "./devbox-info-header";
import { DevboxInfoMetrics } from "./devbox-info-metrics";
import { DevboxInfoPorts } from "./devbox-info-ports";
import { DevboxInfoActions } from "./devbox-info-actions";

interface DevboxInfoMessageProps {
  payload: CustomResourceTarget;
}

export const DevboxInfoMessageCard: React.FC<DevboxInfoMessageProps> = ({
  payload,
}) => {
  const context = createK8sContext();
  const metricsContext = createMetricsContext();

  const devboxTrpcClient = devboxClient.useTRPC();

  // Fetch devbox data using the target
  const {
    data: devboxData,
    isLoading,
    error,
  } = useQuery(
    devboxTrpcClient.getDevbox.queryOptions({
      target: payload,
    })
  );

  // Fetch devbox monitor data
  const { data: monitorData } = useQuery(
    getDevboxRangedMonitorOptions(metricsContext, devboxData?.name || "")
  );

  // Get region URL from the K8s context
  const regionUrl = context.regionUrl;

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full bg-background-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground">
              Loading devbox information...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error || !devboxData) {
    return (
      <Card className="w-full bg-background-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <span className="text-destructive">
              Failed to load devbox information
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-background-secondary">
      <DevboxInfoHeader devboxData={devboxData} regionUrl={regionUrl} />
      
      <CardContent className="space-y-4">
        <DevboxInfoMetrics devboxData={devboxData} monitorData={monitorData} />
        <DevboxInfoPorts devboxData={devboxData} />
        <DevboxInfoActions devboxData={devboxData} />
      </CardContent>
    </Card>
  );
};

export default DevboxInfoMessageCard;
