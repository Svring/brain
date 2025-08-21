"use client";

import BaseNode from "../../base-node-wrapper";
import NodeStack from "../../components/node-stack";
import { cn } from "@/lib/utils";
import { Network, Globe, HelpCircle } from "lucide-react";
import type { DevboxPort } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

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
  const { sendSystemMessage: emitMessage } = useSendSystemMessageMutation();

  const handleNodeClick = () => {
    emitMessage({
      type: "info.networkInfo",
      payload: parent,
    });
  };

  // console.log("readyStatus", readyStatus);

  const mainCard = (
    <BaseNode nodeData={data} className={cn("h-14 p-2", getBackgroundColor())}>
      <div
        className="flex h-full flex-col justify-between cursor-pointer"
        onClick={handleNodeClick}
      >
        {/* Single Port Display */}
        <div className="flex items-center justify-center h-full">
          {resource.ports?.[0] &&
            (() => {
              const port = resource.ports[0];
              const hasPublicAddress = !!port.publicAddress;
              const address = port.publicAddress || port.privateAddress;

              // Check if network is not ready
              const statusData = readyStatus as any;
              const isNetworkNotReady = statusData?.data?.some(
                (item: any) => !item.ready
              );

              const handleIconClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (isNetworkNotReady) {
                  const target = convertResourceObjectToTarget({
                    kind: parent.kind,
                    name: parent.name,
                  });
                  emitMessage({
                    type: "diagnose.network",
                    payload: target,
                  });
                }
              };

              return (
                <div className="flex items-center justify-center gap-2 text-sm w-full">
                  {isNetworkNotReady ? (
                    <HelpCircle
                      className={cn(
                        "h-4 w-4 flex-shrink-0 cursor-help",
                        getBackgroundColor() === "bg-status-error/20"
                          ? "text-red-500"
                          : "text-yellow-500"
                      )}
                      onClick={handleIconClick}
                    />
                  ) : (
                    <Globe
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        hasPublicAddress
                          ? "text-theme-green"
                          : "text-theme-blue"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "truncate min-w-0",
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
      data={resource.ports.slice(1) || []}
      height="14"
      backgroundColor={getBackgroundColor()}
    />
  );
}
