"use client";

import BaseNode from "../../base-node-wrapper";
import { Package, HardDrive } from "lucide-react";
import NodeStatusLight from "../../components/node-status-light";
import NodePods from "../../components/node-pods";
import NodeMonitor from "../../components/node-monitor";
import StatefulsetNodeTitle from "./statefulset-node-title";
import { StatefulsetObject } from "@/lib/sealos/resources/statefulset/statefulset-object-schema";
import { truncateImage } from "@/lib/sealos/sealos-utils";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import NodeLog from "../../components/node-log";
import { useResourceDelete } from "@/hooks/sealos/resource/use-resource-delete";
import { useResourceNodeEnhancer } from "@/hooks/flowgraph/use-resource-node-enhancer";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import NodeLoading from "../../components/node-loading";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// Enhanced wrapper that can handle both K8sResource and StatefulsetObject
function StatefulsetNodeWrapper({
  data,
}: {
  data: StatefulsetObject | BuiltinResourceTarget;
}) {
  // Check if we have a complete StatefulsetObject or just a basic K8sResource
  const isCompleteObject =
    "image" in data && "resource" in data && "ports" in data;

  // Always extract resource data to ensure consistent hook calls
  const resourceData = {
    kind: "statefulset", // Hardcoded kind
    name: data.name!,
  };

  // Construct node ID following the same pattern as other nodes
  const nodeId = `${resourceData.kind.toLowerCase()}-${resourceData.name}`;

  // Always call hooks in the same order
  const { completeResource, status } = useResourceNodeEnhancer(resourceData);

  // If we have complete object data, render the full node
  if (isCompleteObject) {
    return (
      <StatefulsetNode
        resource={data as StatefulsetObject}
        status={status || "Pending"}
        nodeId={nodeId}
      />
    );
  }

  // If we have complete resource data from enhancement, render the full node
  if (
    completeResource &&
    "image" in completeResource &&
    "resource" in completeResource
  ) {
    return (
      <StatefulsetNode
        resource={completeResource as StatefulsetObject}
        status={status || "Pending"}
        nodeId={nodeId}
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
function StatefulsetNode({
  resource,
  status,
  nodeId,
}: {
  resource: StatefulsetObject;
  status?: string;
  nodeId: string;
}) {
  // Get resource metrics data using the hook data
  const target = convertResourceObjectToTarget(resource);

  const { status: metricsStatus } = useResourceMetricsStatus({
    target,
  });

  // Use the delete hook
  const { isPending: isDeletingStatefulset } = useResourceDelete(target);

  const mainCard = (
    <BaseNode
      target={target}
      nodeId={nodeId}
      messageType="launchpad.detail"
      className={
        isDeletingStatefulset || metricsStatus === "high"
          ? "bg-theme-red/50"
          : ""
      }
    >
      <div className="flex h-full flex-col gap-2 justify-between">
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <StatefulsetNodeTitle name={resource.name} />
          {/* <StatefulsetNodeMenu object={resource} /> */}
        </div>

        {/* Image with Package Icon */}
        <div className="flex items-center gap-2 mt-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground truncate flex-1">
            Image: {resource.image ? truncateImage(resource.image) : "N/A"}
          </div>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight status={status || "Pending"} />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            <NodePods target={target} />
            <NodeLog target={target} />
            <NodeMonitor target={target} />
          </div>
        </div>
      </div>
    </BaseNode>
  );

  // Hem component displaying storage information
  const hemComponent = (
    <div className="relative bg-node-background w-full h-full flex items-center rounded-b-xl text-xs text-muted-foreground overflow-hidden px-2 py-1">
      {/* Foreground content row */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {/* Left side: Volume icon and label */}
        <div className="flex items-center gap-1">
          <HardDrive className="h-5 w-5" />
          <span className="text-md">Storage</span>
        </div>

        {/* Right side: Storage capacity */}
        <div className="text-xs">{resource.resource?.storage || "N/A"}GB</div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Hem component - positioned above main card */}
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
export default StatefulsetNodeWrapper;
