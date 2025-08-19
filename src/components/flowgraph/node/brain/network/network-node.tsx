"use client";

import BaseNode from "../../base-node-wrapper";
import NodeStack from "../../components/node-stack";
import { cn } from "@/lib/utils";
import { Network, Globe } from "lucide-react";
import type { DevboxPort } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useNetworkStatus } from "@/hooks/sealos/use-network-status";

interface NetworkResource {
  ports: DevboxPort[];
  [key: string]: any;
}

export default function NetworkNode({
  data,
}: {
  data: {
    resource: NetworkResource;
    parent: any;
  };
}) {
  const { resource, parent } = data;

  const { readyStatus, getBackgroundColor } = useNetworkStatus({ parent });

  // console.log("readyStatus", readyStatus);

  const mainCard = (
    <BaseNode nodeData={data} className={cn("h-14 p-2", getBackgroundColor())}>
      <div className="flex h-full flex-col justify-between">
        {/* Single Port Display */}
        <div className="flex items-center justify-center h-full">
          {resource.ports?.[0] &&
            (() => {
              const port = resource.ports[0];
              const hasPublicAddress = !!port.publicAddress;
              const address = port.publicAddress || port.privateAddress;

              return (
                <div className="flex items-center gap-2 text-sm w-full">
                  <Globe
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      hasPublicAddress ? "text-theme-green" : "text-theme-blue"
                    )}
                  />
                  <span
                    className={cn(
                      "truncate min-w-0 flex-1",
                      hasPublicAddress
                        ? "text-foreground cursor-pointer hover:text-foreground/80"
                        : "text-foreground"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasPublicAddress && address) {
                        window.open(address, "_blank");
                      }
                    }}
                  >
                    {address}
                  </span>
                </div>
              );
            })()}
        </div>
      </div>
    </BaseNode>
  );

  return (
    <NodeStack
      mainCard={mainCard}
      data={resource.ports || []}
      height="14"
      backgroundColor={getBackgroundColor()}
    />
  );
}
