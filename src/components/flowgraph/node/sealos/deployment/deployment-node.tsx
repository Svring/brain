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
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useLaunchpadObject } from "@/hooks/sealos/launchpad/use-launchpad-object";
import { useResourceDelete } from "@/hooks/sealos/resource/use-resource-delete";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { useResourceNodeEnhancer } from "@/hooks/flowgraph/use-resource-node-enhancer";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import NodeLoading from "../../components/node-loading";
import NodePods from "../../components/node-pods";

// Enhanced wrapper that can handle both K8sResource and DeploymentObject
function DeploymentNodeWrapper({
  data,
}: {
  data: DeploymentObject | K8sResource;
}) {
  // Check if we have a complete DeploymentObject or just a basic K8sResource
  const isCompleteObject =
    "image" in data && "resource" in data && "ports" in data;

  // Always extract resource data to ensure consistent hook calls
  const resourceData = {
    kind: data.kind,
    name: isCompleteObject
      ? (data as DeploymentObject).name
      : (data as K8sResource).metadata?.name || "",
  };

  // Always call hooks in the same order
  const { completeResource, status } = useResourceNodeEnhancer(resourceData);

  // console.log("completeResource", completeResource);

  // If we have complete object data, render the full node
  if (isCompleteObject) {
    return (
      <DeploymentNode
        resource={data as DeploymentObject}
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
      <DeploymentNode
        resource={completeResource as DeploymentObject}
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
function DeploymentNode({
  resource,
  status,
}: {
  resource: DeploymentObject;
  status?: string;
}) {
  const { sendSystemMessage: emitMessage } = useAppendSystemMessageMutation();

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
  const { monitorData, isLoading: isMetricsLoading } = useResourceMetricsStatus(
    {
      target,
    }
  );

  // Use the delete hook
  const { isDeleting: isDeletingDeployment } = useResourceDelete({
    status,
    target,
  });

  const handleNodeClick = () => {
    const target = convertResourceObjectToTarget({
      kind: deploymentData.kind,
      name: deploymentData.name,
    });

    emitMessage({
      type: "info.launchpadInfo",
      payload: target,
    });
  };

  const mainCard = (
    <BaseNode
      nodeData={resource}
      className={isDeletingDeployment ? "border-theme-red" : ""}
    >
      <div
        className="flex h-full flex-col gap-2 justify-between"
        onClick={handleNodeClick}
      >
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
            <NodePods target={target} />
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

  return <NodeStack mainCard={mainCard} data={replicasArray} />;
}

// Export the wrapper as the default component
export default DeploymentNodeWrapper;
