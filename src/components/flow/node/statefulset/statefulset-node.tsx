"use client";

import BaseNode from "../base-node";

interface StatefulSetNodeProps {
  name: string;
  state: "Running" | "Stopped" | "Unknown";
}

export default function StatefulSetNode({ name, state }: StatefulSetNodeProps) {
  return (
    <BaseNode>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="truncate text-muted-foreground text-sm">
              Stateful Set
            </span>
            <span className="w-40 overflow-hidden text-ellipsis text-left font-bold text-foreground text-md">
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
