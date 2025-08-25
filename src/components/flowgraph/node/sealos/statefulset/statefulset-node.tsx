"use client";

import BaseNode from "../../base-node-wrapper";
import { Package, HardDrive } from "lucide-react";
import NodeStatusLight from "../../components/node-status-light";
import NodeInternalUrl from "../../components/node-internal-url";
import NodePods from "../../components/node-pods";
import NodeMonitor from "../../components/node-monitor";
import StatefulsetNodeTitle from "./statefulset-node-title";
import StatefulsetNodeMenu from "./statefulset-node-menu";
import { StatefulsetObjectQuery } from "@/lib/sealos/resources/statefulset/statefulset-object-query-schema";
import { truncateImage } from "@/lib/sealos/sealos-utils";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import NodeLog from "../../components/node-log";
import { useResourceMetrics } from "@/hooks/sealos/resource/use-resource-metrics";
import { useLaunchpadObject } from "@/hooks/sealos/launchpad/use-launchpad-object";
import { useResourceDelete } from "@/hooks/sealos/resource/use-resource-delete";
import { useResourceNodeEnhancer } from "@/hooks/flowgraph/use-resource-node-enhancer";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import NodeLoading from "../../components/node-loading";

// Enhanced wrapper that can handle both K8sResource and StatefulsetObjectQuery
function StatefulsetNodeWrapper({
  data,
}: {
  data: StatefulsetObjectQuery | K8sResource;
}) {
  // Check if we have a complete StatefulsetObjectQuery or just a basic K8sResource
  const isCompleteObject =
    "image" in data && "resource" in data && "ports" in data;

  // Always extract resource data to ensure consistent hook calls
  const resourceData = {
    kind: data.kind,
    name: isCompleteObject
      ? (data as StatefulsetObjectQuery).name
      : (data as K8sResource).metadata?.name || "",
  };

  // Always call hooks in the same order
  const { completeResource, status } = useResourceNodeEnhancer(resourceData);
  const target = convertResourceObjectToTarget(resourceData);

  // If we have complete object data, render the full node
  if (isCompleteObject) {
    return (
      <StatefulsetNode
        resource={data as StatefulsetObjectQuery}
        status={status || "Pending"}
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
        resource={completeResource as StatefulsetObjectQuery}
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
function StatefulsetNode({
  resource,
  status,
}: {
  resource: StatefulsetObjectQuery;
  status?: string;
}) {
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  // Use the new hook to get statefulset data
  const { data: statefulsetData = resource } = useLaunchpadObject(
    resource.name,
    resource.kind
  );

  // Get resource metrics data using the hook data
  const target = convertResourceObjectToTarget({
    kind: statefulsetData.kind,
    name: statefulsetData.name,
  });
  const { monitorData, isLoading: isMetricsLoading } =
    useResourceMetrics(target);

  // Use the delete hook
  const { isDeleting: isDeletingStatefulset } = useResourceDelete({
    status,
    target,
  });

  // Create target for the NodeLog component
  const logTarget = convertResourceObjectToTarget({
    kind: statefulsetData.kind,
    name: statefulsetData.name,
  });

  const mainCard = (
    <BaseNode
      nodeData={resource}
      className={isDeletingStatefulset ? "border-theme-red" : ""}
    >
      <div
        className="flex h-full flex-col gap-2 justify-between"
        onClick={() => {
          appendSystemMessage("launchpad.detail", target);
        }}
      >
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <StatefulsetNodeTitle name={statefulsetData.name} />
          {/* <StatefulsetNodeMenu object={resource} /> */}
        </div>

        {/* Image with Package Icon */}
        <div className="flex items-center gap-2 mt-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground truncate flex-1">
            Image:{" "}
            {statefulsetData.image
              ? truncateImage(statefulsetData.image)
              : "N/A"}
          </div>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight status={status || "Pending"} />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            <NodePods target={target} />
            <NodeLog target={logTarget} />
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
        <div className="text-xs">
          {statefulsetData.resource?.storage || "N/A"}
        </div>
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
