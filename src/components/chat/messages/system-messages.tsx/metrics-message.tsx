import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MetricRow } from "@/components/chat/messages/components/metric-row";

interface MetricsMessageProps {
  payload: {
    resourceName?: string;
    resource?: any;
    monitorData?: Record<
      string,
      {
        cpu: Array<[string, string]>;
        memory: Array<[string, string]>;
        storage?: Array<[string, string]>;
      }
    >;
    isLoading?: boolean;
  };
}

export const MetricsMessageCard: React.FC<MetricsMessageProps> = ({
  payload,
}) => {
  const {
    resourceName = "Unknown Resource",
    resource,
    monitorData,
    isLoading = false,
  } = payload;

  console.log("monitorData", monitorData);

  // Determine which metrics to show based on available data
  const showCpu = monitorData && Object.keys(monitorData).length > 0;
  const showMemory = monitorData && Object.keys(monitorData).length > 0;
  const showStorage =
    monitorData &&
    Object.keys(monitorData).length > 0 &&
    Object.values(monitorData).some(
      (data) => data.storage && data.storage.length > 0
    );

  // Get all keys from monitor data
  const monitorKeys = monitorData ? Object.keys(monitorData) : [];

  return (
    <Card className="w-full bg-node-background">
      <CardContent className="">
        {/* Header */}
        <div className="mb-0">
          <h3 className="text-lg font-semibold text-foreground">
            Resource Metrics
          </h3>{" "}
        </div>

        {/* Metrics Rows */}
        <div className="space-y-8">
          {monitorKeys.length > 0 ? (
            monitorKeys.map((key) => (
              <div key={key} className="space-y-6">
                <div className="border-b pb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {key}
                  </h4>
                </div>

                <div className="space-y-6">
                  {showCpu && monitorData[key].cpu && (
                    <MetricRow
                      metric="cpu"
                      resource={resource}
                      monitorData={monitorData[key].cpu}
                      isLoading={isLoading}
                    />
                  )}

                  {showMemory && monitorData[key].memory && (
                    <MetricRow
                      metric="memory"
                      resource={resource}
                      monitorData={monitorData[key].memory}
                      isLoading={isLoading}
                    />
                  )}

                  {showStorage && monitorData[key].storage && (
                    <MetricRow
                      metric="storage"
                      resource={resource}
                      monitorData={monitorData[key].storage}
                      isLoading={isLoading}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No monitoring data available for {resourceName}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsMessageCard;
