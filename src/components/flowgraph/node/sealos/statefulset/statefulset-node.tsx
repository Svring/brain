"use client";

import BaseNode from "../../base-node-wrapper";
import { Package } from "lucide-react";
import NodeStatusLight from "../../components/node-status-light";
import NodeInternalUrl from "../../components/node-internal-url";
import NodePods from "../../components/node-pods";
import NodeMonitor from "../../components/node-monitor";
import StatefulsetNodeTitle from "./statefulset-node-title";
import StatefulsetNodeMenu from "./statefulset-node-menu";
import { StatefulsetObject } from "@/lib/sealos/resources/statefulset/statefulset-object-schema";
import { truncateImage } from "@/lib/sealos/sealos-utils";
import { useIsMutating } from "@tanstack/react-query";
import { useEmitSystemMessage } from "@/lib/copilot/message/message-utils";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

export default function StatefulsetNode({ data }: { data: StatefulsetObject }) {
  const { name, image, status, ports, pods } = data;
  const { emitMessage } = useEmitSystemMessage();

  // Check if this statefulset is being deleted
  const isDeletingStatefulset = useIsMutating({
    predicate: (mutation) => {
      // Check if this is a delete launchpad mutation for this specific statefulset
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

    emitMessage(
      `This is your statefulset "${name}".`,
      {
        type: "info.launchpadInfo",
        payload: target,
      }
    );
  };

  return (
    <BaseNode 
      nodeData={data}
      className={isDeletingStatefulset ? "border-theme-red" : ""}
    >
      <div 
        className="flex h-full flex-col gap-2 justify-between"
        onClick={handleNodeClick}
      >
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <StatefulsetNodeTitle name={name} />
          <StatefulsetNodeMenu object={data} />
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
                : status.readyReplicas === status.replicas &&
                  status.unavailableReplicas === 0
                ? "Running"
                : "Pending"
            }
          />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            {/* <NodeInternalUrl ports={ports || []} />
            <NodePods pods={pods || []} /> */}
            <NodeMonitor />
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
