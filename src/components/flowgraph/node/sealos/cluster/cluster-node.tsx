"use client";

import BaseNode from "../../base-node-wrapper";
import NodeStatusLight from "../../components/node-status-light";
import NodeLog from "../../components/node-log";
import NodeMonitor from "../../components/node-monitor";
import ClusterNodeTitle from "./cluster-node-title";
import ClusterNodeMenu from "./cluster-node-menu";
import ClusterNodeBackup from "./cluster-node-backup";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeClusterPublicConnectionString } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import { Globe, HardDrive } from "lucide-react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClusterNodeProps {
  data: ClusterObject;
}

function ClusterNodeWrapper({ data }: ClusterNodeProps) {
  // Construct node ID following the same pattern as other nodes
  const nodeId = `${data.kind?.toLowerCase() || "cluster"}-${data.name || ""}`;

  return (
    <ClusterNode
      resource={data}
      nodeId={nodeId}
    />
  );
}

interface ClusterNodeInnerProps {
  resource: ClusterObject;
  nodeId: string;
}

function ClusterNode({ resource, nodeId }: ClusterNodeInnerProps) {
  const k8sContext = createK8sContext();
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("cluster", resource.name || "")
  );
  const { resource: clusterData, status } = useResourceStatus(target);
  const data = clusterData || resource;
  const { latestData } = useResourceMetricsStatus({ target });
  const storagePercent = Math.min(
    100,
    Math.max(
      0,
      Number(latestData?.storage) <= 1
        ? Number(latestData?.storage) * 100
        : Number(latestData?.storage) || 0
    )
  );
  const connectionString = composeClusterPublicConnectionString(
    data,
    k8sContext.regionUrl
  );
  const { name = "", type = "", resource: clusterResource } = data;

  const mainCard = (
    <BaseNode target={target} nodeId={nodeId}>
      <div className="flex h-full flex-col gap-4 justify-between">
        <div className="flex items-center justify-between">
          <ClusterNodeTitle name={name} type={type!} />
          <ClusterNodeMenu object={data} />
        </div>
        <div className="flex items-center gap-2 text-md">
          <Globe
            className={`h-4 w-4 ${
              connectionString ? "text-theme-green" : "text-theme-gray"
            }`}
          />
          <span
            className={
              connectionString ? "text-foreground" : "text-muted-foreground"
            }
          >
            Public Access
          </span>
        </div>
        <div className="mt-auto flex justify-between items-center">
          <NodeStatusLight status={status || "Pending"} />
          <div className="flex items-center gap-2">
            {/* <ClusterNodeBackup target={target} /> */}
            <NodeLog target={target} />
            <NodeMonitor target={target} />
          </div>
        </div>
      </div>
    </BaseNode>
  );

  const hemComponent = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative bg-node-background w-full h-10 flex items-center rounded-b-xl text-xs text-muted-foreground overflow-hidden px-2 cursor-pointer hover:brightness-120">
            <div
              className="absolute inset-y-0 left-0 bg-muted"
              style={{ width: `${storagePercent}%` }}
            />
            <div className="relative z-10 flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <HardDrive className="h-5 w-5" />
                <span className="text-md">Volume</span>
              </div>
              <div className="text-xs">
                {Array.isArray(clusterResource)
                  ? "N/A"
                  : clusterResource?.storage || "N/A"}{" "}
                GB
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg p-2"
        >
          <div className="text-xs">{storagePercent.toFixed(1)}% used</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 z-10">
        <div className="bg-muted border border-border-primary rounded-xl pt-8 text-xs flex flex-col h-60">
          <div className="flex-1" />
          {hemComponent}
        </div>
      </div>
      <div className="relative z-20">{mainCard}</div>
    </div>
  );
}

export default ClusterNodeWrapper;
