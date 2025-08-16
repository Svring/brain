import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Cpu, MemoryStick, GitBranch, Copy, Check } from "lucide-react";
import { useEmitSystemMessage } from "@/lib/copilot/message/message-utils";
import { createK8sContext } from "@/lib/auth/auth-utils";
import {
  getDevboxOptions,
  getDevboxRangedMonitorOptions,
} from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import { useQuery } from "@tanstack/react-query";
import { createMetricsContext } from "@/lib/auth/auth-utils";
import NodeMonitor from "@/components/flowgraph/node/components/node-monitor";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DevboxInfoMessageProps {
  payload: CustomResourceTarget;
}

export const DevboxInfoMessageCard: React.FC<DevboxInfoMessageProps> = ({
  payload,
}) => {
  const { emitMessage } = useEmitSystemMessage();
  const context = createK8sContext();
  const metricsContext = createMetricsContext();
  const [copyStates, setCopyStates] = useState<{ [key: string]: boolean }>({});

  // Fetch devbox data using the target
  const {
    data: devboxData,
    isLoading,
    error,
  } = useQuery(getDevboxOptions(context, payload));

  // Fetch devbox monitor data
  const { data: monitorData } = useQuery(
    getDevboxRangedMonitorOptions(metricsContext, devboxData?.name || "")
  );

  console.log("monitorData", monitorData);

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

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);

    // Set the copy state to true (show check icon)
    setCopyStates((prev) => ({ ...prev, [key]: true }));

    // Reset back to copy icon after 5 seconds
    setTimeout(() => {
      setCopyStates((prev) => ({ ...prev, [key]: false }));
    }, 5000);
  };

  const handleReleasesClick = () => {
    emitMessage(`Fetching releases for your devbox "${devboxData.name}"...`, {
      type: "info.devboxRelease",
      payload: {
        devboxName: devboxData.name,
        releases: [], // The system will fetch and populate this
      },
    });
  };

  return (
    <Card className="w-full bg-background-secondary">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <Image
                src={`https://devbox.${regionUrl}/images/runtime/${
                  devboxData.image.split("-")[0]
                }.svg`}
                alt="Devbox Icon"
                width={24}
                height={24}
                className="rounded-lg h-9 w-9 flex-shrink-0"
                priority
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground leading-none">
                  Devbox
                </span>
                <span className="text-lg font-bold text-foreground leading-tight truncate">
                  {devboxData.name}
                </span>
              </div>
            </div>
          </div>
          <Badge>{devboxData.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* CPU and Memory with Monitoring Charts */}
        <div className="space-y-6 p-6 border rounded-lg">
          {/* CPU Group */}
          <div className="grid grid-cols-5 gap-6 items-center">
            {/* CPU Info */}
            <div className="col-span-1 flex flex-col items-center gap-2 text-center">
              <Cpu className="w-5 h-5" />
              <span className="text-xs text-muted-foreground">CPU</span>
              <div className="text-lg font-medium">
                {devboxData.resources.cpu}m
              </div>
            </div>
            
            {/* CPU Chart */}
            <div className="col-span-4">
              {monitorData && Object.keys(monitorData).length > 0 ? (
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
                  Loading...
                </div>
              )}
            </div>
          </div>

          {/* Memory Group */}
          <div className="grid grid-cols-5 gap-6 items-center">
            {/* Memory Info */}
            <div className="col-span-1 flex flex-col items-center gap-2 text-center">
              <MemoryStick className="w-5 h-5" />
              <span className="text-xs text-muted-foreground">Memory</span>
              <div className="text-lg font-medium">
                {devboxData.resources.memory}MB
              </div>
            </div>
            
            {/* Memory Chart */}
            <div className="col-span-4">
              {monitorData && Object.keys(monitorData).length > 0 ? (
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
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ports */}
        {devboxData.ports && devboxData.ports.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Ports ({devboxData.ports.length})</h4>
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
                  {devboxData.ports.map((port: any, index: number) => (
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
            onClick={handleReleasesClick}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Releases
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevboxInfoMessageCard;
