"use client";

import BaseNode from "../base-node";

interface DevboxNodeProps {
  name: string;
}

export default function DevboxNode({ data }: { data: DevboxNodeProps }) {
  const { name } = data;

  return (
    <BaseNode>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="w-40 overflow-hidden text-ellipsis text-left font-bold text-foreground text-md">
              {name}
            </span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
