"use client";

import BaseNode from "../../base-node-wrapper";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface PersistentVolumeNodeProps {
  name: string;
  volume: string;
  target: BuiltinResourceTarget;
}

export default function PersistentVolumeNode({
  data,
}: {
  data: PersistentVolumeNodeProps;
}) {
  const { name, volume, target } = data;

  return (
    <BaseNode target={target}>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="truncate text-muted-foreground text-sm">
              Persistent Volume
            </span>
            <span className="w-40 overflow-hidden text-ellipsis text-left font-bold text-foreground text-md">
              {name}
            </span>
            <span className="w-40 overflow-hidden text-ellipsis text-left font-bold text-foreground text-md">
              {volume}
            </span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
