import React from "react";
import { Cpu, MemoryStick, HardDrive } from "lucide-react";
import NodeMonitor from "@/components/flowgraph/node/components/node-monitor";

interface MetricsMonitorProps {
  resource: any;
  monitorData: any;
  isMonitorLoading?: boolean;
  showReplicas?: boolean;
}

export const MetricsMonitor: React.FC<MetricsMonitorProps> = ({
  resource,
  monitorData,
  isMonitorLoading = false,
  showReplicas = false,
}) => {
  if (!resource) {
    return null;
  }

  // Helper function to normalize monitoring data for NodeMonitor
  // NodeMonitor multiplies values by 100, so we need to divide by 100 first
  const normalizeMonitorData = (data: Array<[string, string]>): Array<[string, string]> => {
    return data.map(([timestamp, value]) => [
      timestamp,
      (parseFloat(value) / 100).toString()
    ]);
  };

  return (
    <div className="space-y-4 p-4 border border-dashed rounded-lg">
      {/* CPU Group */}
      <div className="grid grid-cols-5 gap-4 items-center">
        {/* CPU Info */}
        <div className="col-span-1 flex flex-col items-center gap-1 text-center">
          <Cpu className="w-4 h-4" />
          <span className="text-xs text-muted-foreground">CPU</span>
          <div className="text-sm font-medium">
            {resource.cpu}m
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
                const normalizedCpuData = normalizeMonitorData(cpuData);
                return (
                  <div className="h-32">
                    <NodeMonitor
                      data={normalizedCpuData}
                      label="CPU"
                      color="hsl(var(--chart-1))"
                      showTimespan={true}
                    />
                  </div>
                );
              }
              return (
                <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
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
            {resource.memory}MB
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
                const normalizedMemoryData = normalizeMonitorData(memoryData);
                return (
                  <div className="h-32">
                    <NodeMonitor
                      data={normalizedMemoryData}
                      label="Memory"
                      color="hsl(var(--chart-2))"
                      showTimespan={true}
                    />
                  </div>
                );
              }
              return (
                <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
                  No Memory data
                </div>
              );
            })()
          ) : (
            <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Storage Group */}
      {monitorData && Object.keys(monitorData).length > 0 && (() => {
        const podNames = Object.keys(monitorData);
        if (podNames.length > 0) {
          const firstPod = podNames[0];
          const storageData = monitorData[firstPod]?.storage || [];
          if (storageData.length > 0) {
            return (
              <div className="grid grid-cols-5 gap-4 items-center">
                {/* Storage Info */}
                <div className="col-span-1 flex flex-col items-center gap-1 text-center">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-xs text-muted-foreground">Storage</span>
                  <div className="text-sm font-medium">
                    {resource.storage || "N/A"}
                  </div>
                </div>

                {/* Storage Chart */}
                <div className="col-span-4">
                  {(() => {
                    const normalizedStorageData = normalizeMonitorData(storageData);
                    return (
                      <div className="h-32">
                        <NodeMonitor
                          data={normalizedStorageData}
                          label="Storage"
                          color="hsl(var(--chart-3))"
                          showTimespan={true}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          }
        }
        return null;
      })()}
    </div>
  );
};
