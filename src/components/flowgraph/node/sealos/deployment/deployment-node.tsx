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
import { useEmitSystemMessage } from "@/lib/copilot/message/message-utils";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

export default function DeploymentNode({ data }: { data: DeploymentObject }) {
  const { name, image, status, ports, pods, env, resource } = data;
  const { emitMessage } = useEmitSystemMessage();

  // console.log("env", env);
  // console.log("resource", resource);

  // Check if this deployment is being deleted
  const isDeletingDeployment =
    useIsMutating({
      predicate: (mutation) => {
        // Check if this is a delete launchpad mutation for this specific deployment
        const isDeleteMutation =
          mutation.options.mutationFn?.toString().includes("deleteLaunchpad") ??
          false;
        const variables = mutation.state.variables as any;
        return isDeleteMutation && variables?.name === name;
      },
    }) > 0;

  const handleNodeClick = () => {
    const target = convertResourceObjectToTarget({
      kind: data.kind,
      name: data.name,
    });

    emitMessage({
      type: "info.launchpadInfo",
      payload: target,
    });
  };

  // console.log("status", status);
  // console.log("pods", pods);

  const mainCard = (
    <BaseNode
      nodeData={data}
      className={isDeletingDeployment ? "border-theme-red" : ""}
    >
      <div
        className="flex h-full flex-col gap-2 justify-between"
        onClick={handleNodeClick}
      >
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <DeploymentNodeTitle name={name} />
          <DeploymentNodeMenu object={data} />
        </div>

        {/* Image with Package Icon */}
        <div className="flex items-center gap-2 mt-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground truncate flex-1">
            Image: {image ? truncateImage(image) : "N/A"}
          </div>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight
            status={
              status.paused
                ? "Stopped"
                : status.unavailableReplicas !== undefined &&
                  status.unavailableReplicas > 0
                ? "Error"
                : status.readyReplicas === status.replicas
                ? "Running"
                : "Pending"
            }
          />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            {/* <NodeInternalUrl ports={ports || []} />
            <NodePods pods={pods || []} /> */}
            <NodeLog />
            {/* <NodeMonitor /> */}
          </div>
        </div>
      </div>
    </BaseNode>
  );

  // Create an array with length equal to resource.replicas for the stack
  const replicasArray = Array.from(
    { length: resource?.replicas - 1 || 0 },
    (_, i) => i
  );

  return <NodeStack mainCard={mainCard} data={replicasArray} />;
}
