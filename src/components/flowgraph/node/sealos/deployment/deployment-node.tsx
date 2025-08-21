"use client";

import BaseNode from "../../base-node-wrapper";
// import useDeploymentNode from "@/hooks/sealos/deployment/use-deployment-node";
import { Package } from "lucide-react";
import NodeStatusLight from "../../components/node-status-light";
import NodeInternalUrl from "../../components/node-internal-url";
import NodePods from "../../components/node-pods";
import NodeLog from "../../components/node-log";
import NodeMonitor from "../../components/node-monitor";
import NodeStack from "../../components/node-stack";
import DeploymentNodeTitle from "./deployment-node-title";
import DeploymentNodeMenu from "./deployment-node-menu";
import { DeploymentObject } from "@/lib/sealos/resources/deployment/deployment-object-schema";
import { truncateImage } from "@/lib/sealos/sealos-utils";
import { useIsMutating } from "@tanstack/react-query";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useLaunchpadObject } from "@/hooks/sealos/launchpad/use-launchpad-object";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";

// Wrapper component that handles loading state
function DeploymentNodeWrapper({ data }: { data: DeploymentObject }) {
  const target = convertResourceObjectToTarget({
    kind: data.kind,
    name: data.name,
  });

  // Get resource status using the new hook
  const { status, resource, isLoading } = useResourceStatus(target);

  // Return loading state while resource status is being fetched
  if (isLoading) {
    return <DeploymentNode resource={data} status="Pending" />;
  }

  // Once loaded, render the main component with the fetched resource data
  return (
    <DeploymentNode
      resource={resource as DeploymentObject}
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
  const { sendSystemMessage: emitMessage } = useSendSystemMessageMutation();

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

  // Check if this deployment is being deleted
  const isDeletingDeployment =
    useIsMutating({
      predicate: (mutation) => {
        // Check if this is a delete launchpad mutation for this specific deployment
        const isDeleteMutation =
          mutation.options.mutationFn?.toString().includes("deleteLaunchpad") ??
          false;
        const variables = mutation.state.variables as any;
        return isDeleteMutation && variables?.name === deploymentData.name;
      },
    }) > 0;

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

  // Create target for the NodeLog component
  const logTarget = convertResourceObjectToTarget({
    kind: deploymentData.kind,
    name: deploymentData.name,
  });

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
            {/* <NodePods resource={deploymentData} /> */}
            <NodeLog target={logTarget} resourceType="launchpad" />
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
