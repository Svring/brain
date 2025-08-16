import React, { useState } from "react";
import {
  Rocket,
  Cpu,
  MemoryStick,
  Server,
  Globe,
  Clock,
  Monitor,
  FileText,
  Container,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEmitSystemMessage } from "@/lib/copilot/message/message-utils";
import { useQuery } from "@tanstack/react-query";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { createMetricsContext } from "@/lib/auth/auth-utils";
import {
  getLaunchpadOptions,
  getLaunchpadRangedMonitorOptions,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";
import NodeMonitor from "@/components/flowgraph/node/components/node-monitor";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LaunchpadPort {
  port: number;
  protocol: string;
  appProtocol?: string;
  exposesPublicDomain: boolean;
  publicAddress?: string;
}

interface LaunchpadResource {
  cpu: number;
  memory: number;
  replicas: number;
}

interface LaunchpadInfoMessageProps {
  payload: BuiltinResourceTarget;
}

export const LaunchpadInfoMessageCard: React.FC<LaunchpadInfoMessageProps> = ({
  payload,
}) => {
  const { emitMessage } = useEmitSystemMessage();
  const k8sContext = createK8sContext();
  const metricsContext = createMetricsContext();
  const [copyStates, setCopyStates] = useState<{ [key: string]: boolean }>({});

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

  console.log("launchpadData", launchpadData);
  console.log("launchpad monitorData", monitorData);

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
    image = "Unknown Image",
    status,
    resource,
    ports = [],
    kind = "deployment",
  } = launchpadData;

  // Helper function to get status string from different status objects
  const getStatusString = (status: any): string => {
    if (typeof status === "string") return status;

    // Handle deployment status
    if (status?.paused) return "Stopped";
    if (
      status?.unavailableReplicas !== undefined &&
      status.unavailableReplicas > 0
    )
      return "Error";
    if (status?.readyReplicas === status?.replicas) return "Running";
    if (status?.replicas !== undefined) return "Pending";

    // Handle statefulset status
    if (status?.readyReplicas === status?.replicas) return "Running";
    if (status?.replicas !== undefined) return "Pending";

    return "Unknown";
  };

  const statusString = getStatusString(status);

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

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);

    // Set the copy state to true (show check icon)
    setCopyStates((prev) => ({ ...prev, [key]: true }));

    // Reset back to copy icon after 5 seconds
    setTimeout(() => {
      setCopyStates((prev) => ({ ...prev, [key]: false }));
    }, 5000);
  };

  const handleMonitorClick = () => {
    emitMessage(`Opening monitoring for your ${kind} "${name}"...`, {
      type: "info.metrics",
      payload: {
        resourceName: name,
        resourceType: kind,
        resource: resource,
      },
    });
  };

  const handleLogsClick = () => {
    emitMessage(`Fetching logs for your ${kind} "${name}"...`, {
      type: "info.logs",
      payload: {
        resourceName: name,
        resourceType: kind,
        resource: resource,
      },
    });
  };

  const handlePodClick = () => {
    emitMessage(`Displaying pods for your ${kind} "${name}":`, {
      type: "info.pod",
      payload: {
        pods: [], // This will be populated by the system
        resourceName: name,
        resourceType: kind,
      },
    });
  };

  return (
    <Card className="w-full bg-background-secondary">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Rocket className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground leading-none">
                  {kind.charAt(0).toUpperCase() + kind.slice(1)}
                </span>
                <span className="text-lg font-bold text-foreground leading-tight truncate">
                  {name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* CPU and Memory with Monitoring Charts */}
        {resourceInfo && (
          <div className="space-y-6 p-6 border rounded-lg">
            {/* CPU Group */}
            <div className="grid grid-cols-5 gap-6 items-center">
              {/* CPU Info */}
              <div className="col-span-1 flex flex-col items-center gap-2 text-center">
                <Cpu className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-muted-foreground">CPU</span>
                <div className="text-lg font-medium">{resourceInfo.cpu}m</div>
              </div>

              {/* CPU Chart */}
              <div className="col-span-4">
                {monitorData && !isMonitorLoading ? (
                  (() => {
                    const podNames = Object.keys(monitorData);
                    if (podNames.length > 0) {
                      const firstPod = podNames[0];
                      const cpuData = monitorData[firstPod]?.cpu || [];
                      return (
                        <div className="h-full">
                          <NodeMonitor
                            data={cpuData}
                            label="CPU"
                            color="hsl(var(--chart-1))"
                            showTimespan={true}
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        No CPU data
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    {isMonitorLoading ? "Loading..." : "No CPU data"}
                  </div>
                )}
              </div>
            </div>

            {/* Memory Group */}
            <div className="grid grid-cols-5 gap-6 items-center">
              {/* Memory Info */}
              <div className="col-span-1 flex flex-col items-center gap-2 text-center">
                <MemoryStick className="w-5 h-5 text-green-600" />
                <span className="text-xs text-muted-foreground">Memory</span>
                <div className="text-lg font-medium">
                  {resourceInfo.memory}MB
                </div>
              </div>

              {/* Memory Chart */}
              <div className="col-span-4">
                {monitorData && !isMonitorLoading ? (
                  (() => {
                    const podNames = Object.keys(monitorData);
                    if (podNames.length > 0) {
                      const firstPod = podNames[0];
                      const memoryData = monitorData[firstPod]?.memory || [];
                      return (
                        <div className="h-full">
                          <NodeMonitor
                            data={memoryData}
                            label="Memory"
                            color="hsl(var(--chart-2))"
                            showTimespan={true}
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        No Memory data
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    {isMonitorLoading ? "Loading..." : "No Memory data"}
                  </div>
                )}
              </div>
            </div>

            {/* Replicas Info */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-2 text-center">
                <Server className="w-5 h-5 text-purple-600" />
                <span className="text-xs text-muted-foreground">Replicas</span>
                <div className="text-lg font-medium">
                  {resourceInfo.replicas}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ports */}
        {ports && ports.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Ports ({ports.length})</h4>
            <div className="w-full overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Number</TableHead>
                    <TableHead className="w-1/2">Private Address</TableHead>
                    <TableHead className="w-1/2">Public Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ports.map((port: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{port.number}</TableCell>
                      <TableCell className="max-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="truncate"
                            title={port.privateAddress || "-"}
                          >
                            {port.privateAddress || "-"}
                          </span>
                          {port.privateAddress && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 flex-shrink-0"
                              onClick={() =>
                                copyToClipboard(
                                  port.privateAddress!,
                                  "Private Address",
                                  `private-${port.number}`
                                )
                              }
                            >
                              {copyStates[`private-${port.number}`] ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="truncate"
                            title={port.publicAddress || "-"}
                          >
                            {port.publicAddress || "-"}
                          </span>
                          {port.publicAddress && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 flex-shrink-0"
                              onClick={() =>
                                copyToClipboard(
                                  port.publicAddress!,
                                  "Public Address",
                                  `public-${port.number}`
                                )
                              }
                            >
                              {copyStates[`public-${port.number}`] ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            className="flex-1"
            variant="outline"
            onClick={handleLogsClick}
          >
            <FileText className="w-4 h-4 mr-2" />
            Logs
          </Button>
          <Button className="flex-1" variant="outline" onClick={handlePodClick}>
            <Container className="w-4 h-4 mr-2" />
            Pods
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchpadInfoMessageCard;
