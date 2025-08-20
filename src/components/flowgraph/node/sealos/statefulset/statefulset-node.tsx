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

export default function StatefulsetNode({
  data,
}: {
  data: StatefulsetObjectQuery;
}) {
  const { name, image, status, ports, pods, resource } = data;
  const { sendSystemMessage: emitMessage } = useSendSystemMessageMutation();

  // console.log("data", data);

  // Check if this statefulset is being deleted
  const isDeletingStatefulset =
    useIsMutating({
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

    emitMessage({
      type: "info.launchpadInfo",
      payload: target,
    });
  };

  // Create target for the NodeLog component
  const logTarget = convertResourceObjectToTarget({
    kind: data.kind,
    name: data.name,
  });

  const mainCard = (
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
                : status.readyReplicas === status.replicas
                ? "Running"
                : "Pending"
            }
          />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            {/* <NodeInternalUrl ports={ports || []} /> */}
            {/* <NodePods resource={data} /> */}
            <NodeLog target={logTarget} resourceType="launchpad" />
            <NodeMonitor resource={data} />
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
        <div className="text-xs">{resource?.storage || "N/A"}</div>
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
