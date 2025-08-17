import React from "react";
import { Cpu, MemoryStick } from "lucide-react";
import NodeMonitor from "@/components/flowgraph/node/components/node-monitor";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

interface DevboxInfoMetricsProps {
  devboxData: DevboxObject;
  monitorData: any;
}

export const DevboxInfoMetrics: React.FC<DevboxInfoMetricsProps> = ({
  devboxData,
  monitorData,
}) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      {/* CPU Group */}
      <div className="grid grid-cols-5 gap-4 items-center">
        {/* CPU Info */}
        <div className="col-span-1 flex flex-col items-center gap-1 text-center">
          <Cpu className="w-4 h-4" />
          <span className="text-xs text-muted-foreground">CPU</span>
          <div className="text-sm font-medium">
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
                  <div className="h-40">
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
                <div className="flex items-center justify-center h-40 text-xs text-muted-foreground">
                  No CPU data
                </div>
              );
            })()
          ) : (
            <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Memory Group */}
      <div className="grid grid-cols-5 gap-4 items-center">
        {/* Memory Info */}
        <div className="col-span-1 flex flex-col items-center gap-1 text-center">
          <MemoryStick className="w-4 h-4" />
          <span className="text-xs text-muted-foreground">Memory</span>
          <div className="text-sm font-medium">
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
                  <div className="h-40">
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
                <div className="flex items-center justify-center h-40 text-xs text-muted-foreground">
                  No Memory data
                </div>
              );
            })()
          ) : (
            <div className="flex items-center justify-center h-40 text-xs text-muted-foreground">
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
