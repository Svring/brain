"use client";

import BaseNode from "../base-node-wrapper";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { createK8sContext } from "@/lib/auth/auth-utils";
import useDeploymentNode from "@/hooks/sealos/deployment/use-deployment-node";
import { Package } from "lucide-react";
import NodeStatusLight from "../node-components/node-status-light";
import NodeInternalUrl from "../node-components/node-internal-url";
import NodePods from "../node-components/node-pods";
import NodeMonitor from "../node-components/node-monitor";
import DeploymentNodeTitle from "./deployment-node-title";
import DeploymentNodeMenu from "./deployment-node-menu";

export default function DeploymentNode({
  data: { target },
}: {
  data: { target: BuiltinResourceTarget };
}) {
  const { data, isLoading } = useDeploymentNode(createK8sContext(), target);

  if (isLoading || !data) {
    return null;
  }

  const { name, image, status, ports, pods } = data;

  // console.log("deployment data", data);

  return (
    <BaseNode target={target} nodeData={data}>
      <div className="flex h-full flex-col gap-2 justify-between">
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <DeploymentNodeTitle name={name} />
          <DeploymentNodeMenu />
        </div>

        {/* Image with Package Icon */}
        <div className="flex items-center gap-2 mt-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground truncate flex-1">
            Image: {image}
          </div>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight
            status={
              status.unavailableReplicas !== undefined &&
              status.unavailableReplicas > 0
                ? "Error"
                : "Running"
            }
          />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            <NodeInternalUrl ports={ports || []} />
            <NodePods pods={pods || []} />
            <NodeMonitor />
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
