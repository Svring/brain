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
import { useIsMutating } from "@tanstack/react-query";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import NodeLog from "../../components/node-log";
import { useResourceMetrics } from "@/hooks/sealos/resource/use-resource-metrics";
import { useLaunchpadObject } from "@/hooks/sealos/launchpad/use-launchpad-object";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceNodeEnhancer } from "@/hooks/flowgraph/use-resource-node-enhancer";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";

// Enhanced wrapper that can handle both K8sResource and StatefulsetObjectQuery
function StatefulsetNodeWrapper({ data }: { data: StatefulsetObjectQuery | K8sResource }) {
  // Check if we have a complete StatefulsetObjectQuery or just a basic K8sResource
  const isCompleteObject = 'image' in data && 'resource' in data && 'ports' in data;
  
  // Always extract resource data to ensure consistent hook calls
  const resourceData = {
    kind: data.kind,
    name: isCompleteObject 
      ? (data as StatefulsetObjectQuery).name 
      : (data as K8sResource).metadata?.name || '',
  };

  // Always call hooks in the same order
  const { completeResource, isLoadingComplete } = useResourceNodeEnhancer(resourceData);
  const target = convertResourceObjectToTarget(resourceData);
  const { status, isLoading: isLoadingStatus } = useResourceStatus(target);

  // Determine the resource to display
  let displayResource: StatefulsetObjectQuery;
  
  if (isCompleteObject) {
    // Use the complete object directly
    displayResource = data as StatefulsetObjectQuery;
  } else {
    // Use complete resource if available and it's a StatefulsetObjectQuery, otherwise basic resource data
    displayResource = (completeResource && 'image' in completeResource && 'resource' in completeResource) 
      ? (completeResource as StatefulsetObjectQuery)
              : {
            ...resourceData,
            status: 'Loading...',
            operationalStatus: { createdAt: 'Loading...' },
            image: 'Loading...',
            resource: { cpu: '0', memory: '0', replicas: 1, storage: '0' },
            ports: [],
            env: [],
            configMap: [],
            localStorage: [],
            pods: [],
          };
  }

  return (
    <StatefulsetNode
      resource={displayResource}
      status={status || "Pending"}
      isLoadingStatus={isLoadingStatus}
      isLoadingComplete={isLoadingComplete}
    />
  );
}

// Main component that receives the loaded resource data
function StatefulsetNode({
  resource,
  status,
  isLoadingStatus = false,
  isLoadingComplete = false,
}: {
  resource: StatefulsetObjectQuery;
  status?: string;
  isLoadingStatus?: boolean;
  isLoadingComplete?: boolean;
}) {
  const { sendSystemMessage: emitMessage } = useSendSystemMessageMutation();

  // Use the new hook to get statefulset data
  const { data: statefulsetData = resource } = useLaunchpadObject(resource.name, resource.kind);

  // Get resource metrics data using the hook data
  const target = convertResourceObjectToTarget({
    kind: statefulsetData.kind,
    name: statefulsetData.name,
  });
  const { monitorData, isLoading: isMetricsLoading } = useResourceMetrics(target);

  // Check if this statefulset is being deleted
  const isDeletingStatefulset =
    useIsMutating({
      predicate: (mutation) => {
        // Check if this is a delete launchpad mutation for this specific statefulset
        const isDeleteMutation =
          mutation.options.mutationFn?.toString().includes("deleteLaunchpad") ??
          false;
        const variables = mutation.state.variables as any;
        return isDeleteMutation && variables?.name === statefulsetData.name;
      },
    }) > 0;

  const handleNodeClick = () => {
    const target = convertResourceObjectToTarget({
      kind: statefulsetData.kind,
      name: statefulsetData.name,
    });

    emitMessage({
      type: "info.launchpadInfo",
      payload: target,
    });
  };

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
        onClick={handleNodeClick}
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
            Image: {isLoadingComplete ? "Loading..." : (statefulsetData.image ? truncateImage(statefulsetData.image) : "N/A")}
          </div>
          {isLoadingComplete && (
            <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight status={status || "Pending"} />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            {/* <NodeInternalUrl ports={statefulsetData.ports || []} /> */}
            {/* <NodePods resource={statefulsetData} /> */}
            <NodeLog target={logTarget} resourceType="launchpad" />
            <NodeMonitor target={target}/>
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
        <div className="text-xs">{statefulsetData.resource?.storage || "N/A"}</div>
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
