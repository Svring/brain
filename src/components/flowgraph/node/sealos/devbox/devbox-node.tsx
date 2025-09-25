"use client";

import React from "react";
import { Package } from "lucide-react";
import BaseNode from "../../base-node-wrapper";
import { createK8sContext } from "@/lib/auth/auth-utils";
import NodeStatusLight from "../../components/node-status-light";
import DevboxNodeTitle from "./devbox-node-title";
import DevboxNodeMenu from "./devbox-node-menu";
import NodeMonitor from "../../components/node-monitor";
import NodeStack from "../../components/node-stack";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { transformDevboxImage } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";

// Main component that receives the loaded resource data
function DevboxNode({ data }: { data: DevboxObject }) {
  // Construct node ID following the same pattern as other nodes
  const nodeId = `${data.kind?.toLowerCase() || "devbox"}-${data.name || ""}`;
  const resource = data;
  const target = convertResourceObjectToTarget({
    kind: resource.kind,
    name: resource.name,
  });

  const { resource: object, status } = useResourceStatus(target);

  // console.log("object", object);

  const { name, image } = object || resource;

  const context = createK8sContext();
  const { devbox } = useTRPCClients();

  // Fetch devbox releases directly using TRPC client
  const { data: releasesData, isLoading: isReleasesLoading } = useQuery(
    devbox.releases.queryOptions(name)
  );

  const mainCard = (
    <BaseNode target={target} nodeId={nodeId} messageType="devbox.detail" view="main">
      <div className="flex h-full flex-col gap-2 justify-between">
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <DevboxNodeTitle
            name={name}
            image={image}
            regionUrl={context.regionUrl}
          />

          {/* Actions Dropdown Menu */}
          <div className="flex flex-row items-center gap-2 flex-shrink-0">
            <DevboxNodeMenu object={object} />
          </div>
        </div>

        {/* Image with Package Icon */}
        <div className="flex items-center gap-2 mt-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="text-md text-muted-foreground truncate flex-1">
            Image: {transformDevboxImage(image)}
          </div>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight status={status || "Pending"} />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            <NodeMonitor target={target} />
          </div>
        </div>
      </div>
    </BaseNode>
  );

  return (
    <NodeStack
      mainCard={mainCard}
      data={Array.isArray(releasesData) ? releasesData : []}
      target={target}
      nodeId={nodeId}
      view="release"
    />
  );
}

// Export the main component as the default
export default DevboxNode;
