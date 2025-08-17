import React from "react";
import { Cpu, MemoryStick, HardDrive } from "lucide-react";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

interface ClusterInfoMetricsProps {
  clusterData: ClusterObject;
}

export const ClusterInfoMetrics: React.FC<ClusterInfoMetricsProps> = ({
  clusterData,
}) => {
  return (
    <div className="space-y-4 p-4 border border-dashed rounded-lg">
      {/* CPU Group */}
      <div className="grid grid-cols-5 gap-4 items-center">
        {/* CPU Info */}
        <div className="col-span-1 flex flex-col items-center gap-1 text-center">
          <Cpu className="w-4 h-4" />
          <span className="text-xs text-muted-foreground">CPU</span>
          <div className="text-sm font-medium">
            {clusterData.resource?.cpu || "N/A"}
          </div>
        </div>

        {/* CPU Chart */}
        <div className="col-span-4">
          <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
            CPU monitoring data will be available here
          </div>
        </div>
      </div>

      {/* Memory Group */}
      <div className="grid grid-cols-5 gap-4 items-center">
        {/* Memory Info */}
        <div className="col-span-1 flex flex-col items-center gap-1 text-center">
          <MemoryStick className="w-4 h-4" />
          <span className="text-xs text-muted-foreground">Memory</span>
          <div className="text-sm font-medium">
            {clusterData.resource?.memory || "N/A"}
          </div>
        </div>

        {/* Memory Chart */}
        <div className="col-span-4">
          <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
            Memory monitoring data will be available here
          </div>
        </div>
      </div>

      {/* Storage Group */}
      <div className="grid grid-cols-5 gap-4 items-center">
        {/* Storage Info */}
        <div className="col-span-1 flex flex-col items-center gap-1 text-center">
          <HardDrive className="w-4 h-4" />
          <span className="text-xs text-muted-foreground">Storage</span>
          <div className="text-sm font-medium">
            {clusterData.resource?.storage || "N/A"}
          </div>
        </div>

        {/* Storage Chart */}
        <div className="col-span-4">
          <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
            Storage monitoring data will be available here
          </div>
        </div>
      </div>
    </div>
  );
};
