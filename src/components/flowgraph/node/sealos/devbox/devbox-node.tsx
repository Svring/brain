"use client";

import React, { useEffect } from "react";
import { Package } from "lucide-react";
import BaseNode from "../../base-node-wrapper";
import { createK8sContext } from "@/lib/auth/auth-utils";
import NodeStatusLight from "../../components/node-status-light";
import DevboxNodeTitle from "./devbox-node-title";
import DevboxNodeMenu from "./devbox-node-menu";
import NodeMonitor from "../../components/node-monitor";
import NodeStack from "../../components/node-stack";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { createDevboxContext } from "@/lib/auth/auth-utils";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { transformDevboxImage } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { useResourceMetrics } from "@/hooks/sealos/resource/use-resource-metrics";
import { useDevboxRelease } from "@/hooks/sealos/devbox/use-devbox-release";
import { useMutation } from "@tanstack/react-query";
import { useResourceDelete } from "@/hooks/sealos/resource/use-resource-delete";
import { useResourceNodeEnhancer } from "@/hooks/flowgraph/use-resource-node-enhancer";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import NodeLoading from "../../components/node-loading";

// Enhanced wrapper that can handle both K8sResource and DevboxObject
function DevboxNodeWrapper({ data }: { data: DevboxObject | K8sResource }) {
  // Check if we have a complete DevboxObject or just a basic K8sResource
  const isCompleteObject = "ports" in data && "ssh" in data && "image" in data;

  // Always extract resource data to ensure consistent hook calls
  const resourceData = {
    kind: data.kind,
    name: isCompleteObject
      ? (data as DevboxObject).name
      : (data as K8sResource).metadata?.name || "",
  };

  // Always call hooks in the same order
  const { completeResource, status } = useResourceNodeEnhancer(resourceData);

  // If we have complete object data, render the full node
  if (isCompleteObject) {
    return (
      <DevboxNode
        resource={data as DevboxObject}
        status={status || "Pending"}
      />
    );
  }

  // If we have complete resource data from enhancement, render the full node
  if (
    completeResource &&
    "image" in completeResource &&
    "ports" in completeResource
  ) {
    return (
      <DevboxNode
        resource={completeResource as DevboxObject}
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
function DevboxNode({
  resource,
  status,
}: {
  resource: DevboxObject;
  status?: string;
}) {
  // const { name, image, ports, pods } = data;
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const target = convertResourceObjectToTarget({
    kind: resource.kind,
    name: resource.name,
  });

  const { name, image } = resource;

  // console.log("resource", resource);
  // console.log("status", status);

  const context = createK8sContext();

  // Use the delete hook
  const { isDeleting: isDeletingDevbox } = useResourceDelete({
    status,
    target,
  });

  const { releases } = useDevboxRelease(name);

  // Extract the releases array from the response
  const releasesData = releases?.data || [];

  const handleNodeClick = () => {
    appendSystemMessage("devbox.detail", target);
  };

  const mainCard = (
    <BaseNode
      nodeData={resource}
      className={isDeletingDevbox ? "border-theme-red" : ""}
    >
      <div
        className="flex h-full flex-col gap-2 justify-between"
        onClick={handleNodeClick}
      >
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <DevboxNodeTitle
            name={name}
            image={image}
            regionUrl={context.regionUrl}
          />

          {/* Actions Dropdown Menu */}
          <div className="flex flex-row items-center gap-2 flex-shrink-0">
            <DevboxNodeMenu object={resource} />
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
            {/* <NodeInternalUrl ports={ports} /> */}
            <NodeMonitor target={target} />
          </div>
        </div>
      </div>
    </BaseNode>
  );

  return <NodeStack mainCard={mainCard} data={releasesData} />;
}

// Export the wrapper as the default component
export default DevboxNodeWrapper;
