"use client";

import React from "react";
import { Package } from "lucide-react";
import BaseNode from "../../base-node-wrapper";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { createDevboxContext } from "@/lib/auth/auth-utils";
import NodeStatusLight from "../../components/node-status-light";
import DevboxNodeTitle from "./devbox-node-title";
import DevboxNodeMenu from "./devbox-node-menu";
import NodeInternalUrl from "../../components/node-internal-url";
import NodeMonitor from "../../components/node-monitor";
import NodeStack from "../../components/node-stack";
import DevboxNodeRelease from "./devbox-node-release";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useDeleteDevboxMutation } from "@/lib/sealos/resources/devbox/devbox-method/devbox-mutation";
import { getDevboxReleasesOptions, getDevboxInstantMonitorOptions } from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import { useQuery } from "@tanstack/react-query";
import { useEmitSystemMessage } from "@/lib/copilot/message/message-utils";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { transformDevboxImage } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { createMetricsContext } from "@/lib/auth/auth-utils";

// TODO: Devbox nodes would cause maximum call stack error
export default function DevboxNode({ data }: { data: DevboxObject }) {
  const { name, image, status, ports, pods } = data;
  const { emitMessage } = useEmitSystemMessage();
  const context = createK8sContext();
  const devboxContext = createDevboxContext();
  const metricsContext = createMetricsContext();
  const deleteDevbox = useDeleteDevboxMutation(devboxContext);

  // console.log("data", data);

  // Fetch devbox releases
  const { data: releasesResponse } = useQuery(
    getDevboxReleasesOptions(devboxContext, name)
  );

  // Fetch devbox instant monitor data
  const { data: monitorData } = useQuery(
    getDevboxInstantMonitorOptions(metricsContext, name)
  );

  // Log the monitor data
  console.log("devbox instant monitor data:", monitorData);

  // Extract the releases array from the response
  const releases = releasesResponse?.data || [];

  const handleNodeClick = () => {
    const target = convertResourceObjectToTarget({
      kind: data.kind,
      name: data.name,
    });

    emitMessage({
      type: "info.devboxInfo",
      payload: target,
    });
  };

  const mainCard = (
    <BaseNode
      nodeData={data}
      className={deleteDevbox.isPending ? "border-theme-red" : ""}
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
            <DevboxNodeMenu object={data} />
          </div>
        </div>

        {/* Image with Package Icon */}
        <div className="flex items-center gap-2 mt-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground truncate flex-1">
            Image: {transformDevboxImage(image)}
          </div>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight status={status} />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            {/* <NodeInternalUrl ports={ports} /> */}
            <NodeMonitor monitorData={monitorData} />
          </div>
        </div>
      </div>
    </BaseNode>
  );

  return <NodeStack mainCard={mainCard} data={releases} />;
}
