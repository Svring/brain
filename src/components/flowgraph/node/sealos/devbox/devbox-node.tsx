"use client";

import React from "react";
import { Package } from "lucide-react";
import BaseNode from "../../base-node-wrapper";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { createDevboxContext } from "@/lib/auth/auth-utils";
import NodeStatusLight from "../node-components/node-status-light";
import DevboxNodeIde from "./devbox-node-ide";
import DevboxNodeTitle from "./devbox-node-title";
import DevboxNodeMenu from "./devbox-node-menu";
import NodeInternalUrl from "../node-components/node-internal-url";
import NodeMonitor from "../node-components/node-monitor";
import NodeStack from "../node-components/node-stack";
import DevboxNodeRelease from "./devbox-node-release";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

export default function DevboxNode({ data }: { data: DevboxObject }) {
  const { name, image, status, ports, pods } = data;

  const context = createK8sContext();
  const devboxContext = createDevboxContext();

  const mainCard = (
    <BaseNode nodeData={data}>
      <div className="flex h-full flex-col gap-2 justify-between">
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <DevboxNodeTitle
            name={name}
            image={image}
            regionUrl={context.regionUrl}
          />

          {/* IDE Selector and Dropdown Menu */}
          <div className="flex flex-row items-center gap-2 flex-shrink-0">
            {/* IDE Selector */}
            <DevboxNodeIde
              context={context}
              devboxContext={devboxContext}
              object={data}
            />

            {/* Actions Dropdown Menu */}
            <DevboxNodeMenu object={data} />
          </div>
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
          <NodeStatusLight status={status} />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            <NodeInternalUrl ports={ports} />
            <NodeMonitor />
          </div>
        </div>
      </div>
    </BaseNode>
  );

  const subCard = <DevboxNodeRelease object={data} />;

  return <NodeStack mainCard={mainCard} subCard={subCard} />;
}
