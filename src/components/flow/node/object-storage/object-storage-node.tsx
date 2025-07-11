"use client";

import BaseNode from "../base-node";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface ObjectStorageNodeProps {
  name: string;
  policy: string;
  target: CustomResourceTarget;
}

export default function ObjectStorageNode({
  data,
}: {
  data: ObjectStorageNodeProps;
}) {
  const { name, policy, target } = data;

  return (
    <BaseNode target={target}>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="truncate text-muted-foreground text-sm">
              Object Storage
            </span>
            <span className="w-full overflow-hidden text-ellipsis text-left font-bold text-foreground text-md">
              {name}
            </span>
          </div>
        </div>

        {/* Policy badge */}
        <div className="mt-auto flex justify-start">
          <span className="rounded px-2 py-0.5 text-xs">{policy}</span>
        </div>
      </div>
    </BaseNode>
  );
}
