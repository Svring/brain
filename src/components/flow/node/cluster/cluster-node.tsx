"use client";

import BaseNode from "../base-node";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

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
            <span className="truncate text-muted-foreground text-sm">
              Cluster
            </span>
            <span className="w-full overflow-hidden text-ellipsis text-left font-bold text-foreground text-md">
              {name}
            </span>
          </div>
        </div>

        {/* State badge */}
        <div className="mt-auto flex justify-start">
          <span className="rounded px-2 py-0.5 text-xs">{state}</span>
        </div>
      </div>
    </BaseNode>
  );
}
