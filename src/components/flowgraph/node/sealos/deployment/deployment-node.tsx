"use client";

import BaseNode from "../../base-node-wrapper";
import { Package } from "lucide-react";
import NodeStatusLight from "../../components/node-status-light";
import NodeLog from "../../components/node-log";
import NodeMonitor from "../../components/node-monitor";
import NodeStack from "../../components/node-stack";
import DeploymentNodeTitle from "./deployment-node-title";
import DeploymentNodeMenu from "./deployment-node-menu";
import { DeploymentObject } from "@/lib/sealos/resources/deployment/deployment-object-schema";
import { truncateImage } from "@/lib/sealos/sealos-utils";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useLaunchpadObject } from "@/hooks/sealos/launchpad/use-launchpad-object";
import { useResourceNodeEnhancer } from "@/hooks/flowgraph/use-resource-node-enhancer";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import NodeLoading from "../../components/node-loading";
import NodePods from "../../components/node-pods";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// Enhanced wrapper that can handle both K8sResource and DeploymentObject
function DeploymentNodeWrapper({
  data,
}: {
  data: DeploymentObject | BuiltinResourceTarget;
}) {
  // Check if we have a complete DeploymentObject or just a basic K8sResource
  const isCompleteObject =
    "image" in data && "resource" in data && "ports" in data;

  // Always extract resource data to ensure consistent hook calls
  const resourceData = {
    kind: "deployment", // Hardcoded kind
    name: data.name!,
  };

  // Construct node ID following the same pattern as other nodes
  const nodeId = `${resourceData.kind.toLowerCase()}-${resourceData.name}`;

  // Always call hooks in the same order
  const { completeResource, status } = useResourceNodeEnhancer(resourceData);

  // console.log("completeResource", completeResource);

  // If we have complete object data, render the full node
  if (isCompleteObject) {
    return (
      <DeploymentNode
        resource={data as DeploymentObject}
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
      <DeploymentNode
        resource={completeResource as DeploymentObject}
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
function DeploymentNode({
  resource,
  status,
  nodeId,
}: {
  resource: DeploymentObject;
  status?: string;
  nodeId: string;
}) {
  // Use the new hook to get deployment data
  const { data: deploymentData = resource } = useLaunchpadObject(
    resource.name,
    resource.kind
  );

  // Get resource metrics data using the hook data
  const target = convertResourceObjectToTarget({
    kind: deploymentData.kind,
    name: deploymentData.name,
  });

  const mainCard = (
    <BaseNode
      target={target}
      nodeId={nodeId}
      messageType="launchpad.detail"
    >
      <div className="flex h-full flex-col gap-2 justify-between">
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <DeploymentNodeTitle name={deploymentData.name} />
          <DeploymentNodeMenu object={resource} />
        </div>

        {/* Image with Package Icon */}
        <div className="flex items-center gap-2 mt-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="text-md text-muted-foreground truncate flex-1">
            Image:{" "}
            {deploymentData.image ? truncateImage(deploymentData.image) : "N/A"}
          </div>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight status={status || "Pending"} />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            {/* <NodeInternalUrl ports={deploymentData.ports || []} /> */}
            {/* <NodePods target={target} /> */}
            <NodeLog target={target} />
            <NodeMonitor target={target} />
          </div>
        </div>
      </div>
    </BaseNode>
  );

  // Create an array with length equal to resource.replicas for the stack
  const replicasArray = Array.from(
    { length: deploymentData.resource?.replicas - 1 || 0 },
    (_, i) => i
  );

  return <NodeStack target={target} mainCard={mainCard} data={replicasArray} nodeId={nodeId} />;
}

// Export the wrapper as the default component
export default DeploymentNodeWrapper;
