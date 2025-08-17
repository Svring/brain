import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { createMetricsContext } from "@/lib/auth/auth-utils";
import {
  getLaunchpadOptions,
  getLaunchpadRangedMonitorOptions,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { LaunchpadInfoHeader } from "./launchpad-info-header";
import { MetricRow } from "@/components/chat/messages/components/metric-row";
import { LaunchpadInfoPorts } from "./launchpad-info-ports";
import { LaunchpadInfoActions } from "./launchpad-info-actions";

interface LaunchpadInfoMessageProps {
  payload: BuiltinResourceTarget;
}

export const LaunchpadInfoMessageCard: React.FC<LaunchpadInfoMessageProps> = ({
  payload,
}) => {
  const k8sContext = createK8sContext();
  const metricsContext = createMetricsContext();

  // Fetch launchpad data using the target
  const {
    data: launchpadData,
    isLoading,
    error,
  } = useQuery(getLaunchpadOptions(k8sContext, payload));

  // Fetch monitoring data for the last hour
  const { data: monitorData, isLoading: isMonitorLoading } = useQuery(
    getLaunchpadRangedMonitorOptions(metricsContext, launchpadData?.name || "")
  );

  console.log("monitorData", monitorData);

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full bg-background-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground">
              Loading launchpad information...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error || !launchpadData) {
    return (
      <Card className="w-full bg-background-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <span className="text-destructive">
              Failed to load launchpad information
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract data from the fetched launchpad object
  const {
    name = "Unknown App",
    status,
    resource,
    ports = [],
    kind = "deployment",
    image = "",
  } = launchpadData;

  // Helper function to get resource info
  const getResourceInfo = () => {
    if (resource) return resource;

    // For deployment/statefulset, extract from status
    if (status && typeof status === "object") {
      return {
        cpu: "N/A", // These don't have direct CPU/memory specs
        memory: "N/A",
        replicas: status.replicas || 0,
      };
    }

    return {
      cpu: "N/A",
      memory: "N/A",
      replicas: 0,
    };
  };

  const resourceInfo = getResourceInfo();

  return (
    <Card className="w-full bg-background-secondary">
      <LaunchpadInfoHeader 
        launchpadData={launchpadData}
      />
      <CardContent className="space-y-4">
        <MetricRow metric="cpu" resource={resourceInfo} monitorData={monitorData} isLoading={isMonitorLoading} />
        <MetricRow metric="memory" resource={resourceInfo} monitorData={monitorData} isLoading={isMonitorLoading} />
        <LaunchpadInfoPorts ports={ports} />
      </CardContent>
      <LaunchpadInfoActions 
        name={name}
        kind={kind}
        resource={resourceInfo}
      />
    </Card>
  );
};

export default LaunchpadInfoMessageCard;
