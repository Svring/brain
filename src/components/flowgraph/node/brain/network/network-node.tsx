"use client";

import BaseNode from "../../base-node-wrapper";
import { cn } from "@/lib/utils";
import { Network, Globe } from "lucide-react";
import type { DevboxPort } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

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

  return (
    <BaseNode nodeData={data} className={cn("p-4 h-27")}>
      <div className="flex h-full flex-col justify-between">
        {/* Header */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="flex items-center gap-4">
              <Network className="rounded-lg h-9 w-9 p-1.5 bg-muted" />
              <span className="flex flex-col">
                <span className="text-lg leading-none">Network</span>
              </span>
            </span>
          </div>
        </div>

        {/* Ports List */}
        <div className="flex flex-col gap-1 mt-2">
          {resource.ports?.map((port, index) => {
            const hasPublicAddress = !!port.publicAddress;
            const address = port.publicAddress || port.privateAddress;
            
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Globe 
                  className={cn(
                    "h-4 w-4",
                    hasPublicAddress ? "text-green-500" : "text-blue-500"
                  )} 
                />
                <span className="font-mono">{port.number}</span>
                <span className="text-muted-foreground truncate">{address}</span>
              </div>
            );
          })}
        </div>
      </div>
    </BaseNode>
  );
}
