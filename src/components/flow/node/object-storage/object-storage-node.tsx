"use client";

import BaseNode from "../base-node";

interface ObjectStorageNodeProps {
  name: string;
  policy: string;
}

export default function ObjectStorageNode({
  name,
  policy,
}: ObjectStorageNodeProps) {
  return (
    <BaseNode>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="truncate text-muted-foreground text-sm">
              Object Storage
            </span>
            <span className="w-40 overflow-hidden text-ellipsis text-left font-bold text-foreground text-md">
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
