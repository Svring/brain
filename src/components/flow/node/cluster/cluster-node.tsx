"use client";

import BaseNode from "../base-node-wrapper";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface ClusterNodeProps {
  name: string;
  state: string;
  target: CustomResourceTarget;
}

export default function ClusterNode({ data }: { data: ClusterNodeProps }) {
  const { name, state, target } = data;

  return (
    <BaseNode target={target}>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="flex items-center gap-2">
              <Image
                src="https://dbprovider.bja.sealos.run/logo.svg"
                alt="Cluster Icon"
                width={24}
                height={24}
                className="rounded-lg border border-muted bg-white h-9 w-9"
                priority
              />
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground leading-none">
                  Cluster
                </span>
                <span className="text-lg font-bold text-foreground leading-tight w-40 overflow-hidden text-ellipsis text-left">
                  {name}
                </span>
              </span>
            </span>
          </div>
        </div>

        {/* State badge */}
        <div className="mt-auto flex justify-start">
          <Badge
            variant="outline"
            className={
              typeof state === "string" && state.toLowerCase() === "running"
                ? "border-green-600 text-green-700"
                : ""
            }
          >
            {state}
          </Badge>
        </div>
      </div>
    </BaseNode>
  );
}
