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
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import NodeLog from "../../components/node-log";
import NodeConnect from "../../components/node-connect";
import StatefulsetNodeMenu from "./statefulset-node-menu";

// Simplified wrapper that only accepts complete StatefulsetObject
function StatefulsetNodeWrapper({ data }: { data: StatefulsetObject }) {
  // Construct node ID following the same pattern as other nodes
  const nodeId = `${data.kind?.toLowerCase() || "statefulset"}-${
    data.name || ""
  }`;

  return <StatefulsetNode resource={data} nodeId={nodeId} />;
}

// Main component that receives the loaded resource data
function StatefulsetNode({
  resource,
  nodeId,
}: {
  resource: StatefulsetObject;
  nodeId: string;
}) {
  const target = convertResourceObjectToTarget(resource);

  const { resource: data, status } = useResourceStatus(target);
  const statefulsetData = data || resource;

  const handleConnect = () => {
    console.log("Connect clicked");
    // TODO: Implement connection logic
  };

  const mainCard = (
    <NodeConnect onConnect={handleConnect} target={target}>
      <BaseNode target={target} nodeId={nodeId}>
        <div className="flex h-full flex-col gap-2 justify-between">
          {/* Header with Name and Dropdown */}
          <div className="flex items-center justify-between">
            <StatefulsetNodeTitle name={statefulsetData.name} />
            <StatefulsetNodeMenu object={statefulsetData} />
          </div>

          {/* Image with Package Icon */}
          <div className="flex items-center gap-2 mt-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground truncate flex-1">
              Image:{" "}
              {statefulsetData.image?.imageName
                ? truncateImage(statefulsetData.image.imageName)
                : "N/A"}
            </div>
          </div>

          {/* Bottom section with status and icons */}
          <div className="mt-auto flex justify-between items-center">
            {/* Left: Status light */}
            <NodeStatusLight status={status || "Pending"} />

            {/* Right: Icon components */}
            <div className="flex items-center gap-2">
              {/* <NodePods target={target} /> */}
              <NodeLog target={target} />
              <NodeMonitor target={target} />
            </div>
          </div>
        </div>
      </BaseNode>
    </NodeConnect>
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
          {statefulsetData.resource?.storage || "N/A"}GB
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Hem component - positioned above main card */}
      {hemComponent && (
        <div className="absolute inset-x-0 top-0 z-10">
          <div className="bg-muted border rounded-xl pt-8 text-xs flex flex-col h-60">
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
