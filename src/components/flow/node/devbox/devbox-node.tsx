"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Package, ArrowBigUpDash } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseNode from "../base-node-wrapper";
import useDevboxNode from "@/hooks/sealos/devbox/use-devbox-node";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-method/devbox-utils";
import NodeStatusLight from "../node-components/node-status-light";
import DevboxNodeIde from "./devbox-node-ide";
import DevboxNodeTitle from "./devbox-node-title";
import DevboxNodeMenu from "./devbox-node-menu";
import NodeInternalUrl from "../node-components/node-internal-url";
import NodeMonitor from "../node-components/node-monitor";
import NodePods from "../node-components/node-pods";
import _ from "lodash";

export default function DevboxNode({
  data: { target },
}: {
  data: { target: CustomResourceTarget };
}) {
  const context = createK8sContext();
  const devboxContext = createDevboxContext();
  const { data, isLoading } = useDevboxNode(context, target);

  if (isLoading || !data) {
    return null;
  }

  const { name, image, status, ports } = data;

  console.log(data);

  return (
    <BaseNode target={target} nodeData={data}>
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
              target={target}
              data={data}
            />

            {/* Actions Dropdown Menu */}
            <DevboxNodeMenu />
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
            <NodePods />
            <NodeMonitor />
          </div>
        </div>

        {/* Release Button */}
        <div className="">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              // Add release functionality here
            }}
            size="sm"
            variant="ghost"
            className="w-full border cursor-pointer"
          >
            <ArrowBigUpDash className="h-4 w-4" />
            Release
          </Button>
        </div>
      </div>
    </BaseNode>
  );
}
