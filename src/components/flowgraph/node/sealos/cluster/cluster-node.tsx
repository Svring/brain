"use client";

import BaseNode from "../../base-node-wrapper";
import NodeStatusLight from "../../components/node-status-light";
import NodeInternalUrl from "../../components/node-internal-url";
import NodeMonitor from "../../components/node-monitor";
import NodeLog from "../../components/node-log";
import NodePods from "../../components/node-pods";
import NodeBackup from "../../components/node-backup";
import NodeStack from "../../components/node-stack";
import NodeHem from "../../components/node-hem";
import ClusterNodeTitle from "./cluster-node-title";
import ClusterNodeMenu from "./cluster-node-menu";
import ClusterNodeBackup from "./cluster-node-backup";

import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { convertToDbconnUrl } from "@/lib/sealos/sealos-utils";
import { composeClusterConnectionString } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import { Globe, HardDrive } from "lucide-react";
import { useResourceMetrics } from "@/hooks/sealos/resource/use-resource-metrics";
import { useClusterObject } from "@/hooks/sealos/cluster/use-cluster-object";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { useResourceDelete } from "@/hooks/sealos/resource/use-resource-delete";
import { useResourceNodeEnhancer } from "@/hooks/flowgraph/use-resource-node-enhancer";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import NodeLoading from "../../components/node-loading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Enhanced wrapper that can handle both K8sResource and ClusterObject
function ClusterNodeWrapper({ data }: { data: ClusterObject | K8sResource }) {
  // Check if we have a complete ClusterObject or just a basic K8sResource
  const isCompleteObject =
    "type" in data && "resource" in data && "connection" in data;

  // Always extract resource data to ensure consistent hook calls
  const resourceData = {
    kind: data.kind,
    name: isCompleteObject
      ? (data as ClusterObject).name
      : (data as K8sResource).metadata?.name || "",
  };

  // Always call hooks in the same order
  const { completeResource, isLoadingComplete } =
    useResourceNodeEnhancer(resourceData);
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("cluster", resourceData.name)
  );
  const { status, isLoading: isLoadingStatus } = useResourceStatus(target);

  // If we have complete object data, render the full node
  if (isCompleteObject) {
    return (
      <ClusterNode
        resource={data as ClusterObject}
        status={status || "Pending"}
      />
    );
  }

  // If we have complete resource data from enhancement, render the full node
  if (
    completeResource &&
    "type" in completeResource &&
    "connection" in completeResource
  ) {
    return (
      <ClusterNode
        resource={completeResource as ClusterObject}
        status={status || "Pending"}
      />
    );
  }

  // Otherwise, show loading state
  return (
    <NodeLoading
      kind={resourceData.kind}
      name={resourceData.name}
      status={status || "Pending"}
    />
  );
}

// Main component that receives the loaded resource data
function ClusterNode({
  resource,
  status,
}: {
  resource: ClusterObject;
  status?: string;
}) {
  const { sendSystemMessage } = useSendSystemMessageMutation();

  // Create contexts for API calls
  const k8sContext = createK8sContext();

  // Create target for the cluster
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("cluster", resource.name)
  );

  // Use the new hook to get cluster data
  const { data: clusterData = resource } = useClusterObject(resource.name);

  // console.log("resource cluster", resource);
  // console.log("status", status);

  // Get resource metrics status using the new hook
  const { latestData } = useResourceMetricsStatus({
    target,
  });

  // console.log("latestData", latestData);

  // // Derive a safe storage percentage (0-100). Accepts values in 0-1 or 0-100.
  const storagePercent: number = (() => {
    const raw = latestData?.storage;
    if (raw === undefined || raw === null || Number.isNaN(raw as number)) {
      return 0;
    }
    const value = Number(raw);
    // If it's a fraction (0-1), convert to percent; else clamp to 0-100
    const percent = value <= 1 ? value * 100 : value;
    return Math.max(0, Math.min(100, percent));
  })();

  const { name, type } = clusterData;

  // Construct connection string
  const connectionString = composeClusterConnectionString(
    clusterData,
    k8sContext.regionUrl
  );

  const { isDeleting: isDeletingCluster } = useResourceDelete({
    status,
    target,
  });

  const handleNodeClick = () => {
    // Use the new mutation hook to send messages
    sendSystemMessage({
      type: "info.clusterInfo",
      payload: target,
    });
  };

  const mainCard = (
    <BaseNode
      nodeData={clusterData}
      className={isDeletingCluster ? "border-theme-red" : ""}
    >
      <div
        className="flex h-full flex-col gap-4 justify-between"
        onClick={handleNodeClick}
      >
        {/* Header with Name and Menu */}
        <div className="flex items-center justify-between">
          <ClusterNodeTitle name={name} type={type} />
          <div className="flex-shrink-0">
            <ClusterNodeMenu object={clusterData} />
          </div>
        </div>

        {/* Public Access Indicator */}
        <div className="flex items-center gap-2 text-md">
          <Globe
            className={`h-4 w-4 ${
              connectionString ? "text-theme-green" : "text-theme-gray"
            }`}
          />
          <span
            className={`${
              connectionString ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Public Access
          </span>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight status={status || "Pending"} />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            {/* <NodeInternalUrl ports={[]} /> */}
            {/* <NodePods resource={clusterData || data} /> */}
            <NodeLog target={target} resourceType="cluster" />
            <ClusterNodeBackup object={clusterData} />
            {/* <NodeBackup /> */}
            <NodeMonitor target={target} />
          </div>
        </div>
      </div>
    </BaseNode>
  );

  // Hem component displaying storage information as a progress bar (left-to-right fill)
  const hemComponent = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative bg-node-background w-full h-full flex items-center rounded-b-xl text-xs text-muted-foreground overflow-hidden px-2 py-1 cursor-pointer hover:brightness-120">
            {/* Filled background representing used percentage */}
            <div
              className="absolute inset-y-0 left-0 bg-muted"
              style={{ width: `${storagePercent}%` }}
            />

            {/* Foreground content row */}
            <div className="relative z-10 flex items-center justify-between w-full">
              {/* Left side: Volume icon and label */}
              <div className="flex items-center gap-1">
                <HardDrive className="h-5 w-5" />
                <span className="text-md">Volume</span>
              </div>

              {/* Right side: Resource storage label (capacity) */}
              <div className="text-xs">
                {clusterData.resource?.storage || "N/A"}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg p-2"
        >
          <div className="text-xs">
            <div className="">Storage Usage</div>
            {/* <div>{storagePercent.toFixed(1)}% used</div> */}
            <div className="text-muted-foreground">
              Capacity: {clusterData.resource?.storage || "N/A"}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="relative">
      {/* NodeStack with replicas-based background cards - positioned at the bottom */}
      <div className="relative z-0">
        <NodeStack
          mainCard={null}
          data={Array.from({ length: clusterData.resource?.replicas - 1 || 0 })}
          maxBackgroundCards={2}
          height="60"
          backgroundColor="bg-node-background"
        />
      </div>

      {/* Hem component - positioned above background cards */}
      {hemComponent && (
        <div className="absolute inset-x-0 top-0 z-10">
          <div className="bg-muted border border-border-primary rounded-xl pt-8 text-xs flex flex-col h-60">
            <div className="flex-1"></div>
            <div className="h-10">{hemComponent}</div>
          </div>
        </div>
      )}

      {/* Main card - positioned at the top */}
      <div className="relative z-20">{mainCard}</div>
    </div>
  );
}

// Export the wrapper as the default component
export default ClusterNodeWrapper;
