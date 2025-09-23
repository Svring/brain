"use client";

import BaseNode from "../../base-node-wrapper";
import NodeStatusLight from "../../components/node-status-light";
import NodeLog from "../../components/node-log";
import NodeMonitor from "../../components/node-monitor";
import NodeHem from "../../components/node-hem";
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

function ClusterNode({ data }: ClusterNodeProps) {
  // Construct node ID following the same pattern as other nodes
  const nodeId = `${data.kind?.toLowerCase() || "cluster"}-${data.name || ""}`;
  const resource = data;
  const k8sContext = createK8sContext();
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("cluster", resource.name || "")
  );
  const { resource: clusterData, status } = useResourceStatus(target);
  const clusterResource = clusterData || resource;
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
    clusterResource,
    k8sContext.regionUrl
  );
  const {
    name = "",
    type = "",
    resource: clusterResourceData,
  } = clusterResource;

  const mainCard = (
    <BaseNode
      target={target}
      nodeId={nodeId}
      messageType="cluster.detail"
      view="main"
    >
      <div className="flex h-full flex-col gap-4 justify-between">
        <div className="flex items-center justify-between">
          <ClusterNodeTitle name={name} type={type!} />
          <ClusterNodeMenu object={clusterResource} />
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
              className={`absolute inset-y-0 left-0 ${
                storagePercent > 90
                  ? "bg-status-error/20"
                  : storagePercent > 75
                  ? "bg-theme-yellow/10"
                  : "bg-muted"
              }`}
              style={{ width: `${storagePercent}%` }}
            />
            <div className="relative z-10 flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <HardDrive className="h-5 w-5" />
                <span className="text-md">Volume</span>
              </div>
              <div className="text-xs">
                {Array.isArray(clusterResourceData)
                  ? "N/A"
                  : clusterResourceData?.storage || "N/A"}{" "}
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

  return <NodeHem mainCard={mainCard} hemComponent={hemComponent} />;
}

export default ClusterNode;
