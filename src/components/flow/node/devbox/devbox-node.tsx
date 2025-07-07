"use client";

import Image from "next/image";
import BaseNode from "../base-node";

interface DevboxNodeProps {
  name: string;
  type: string;
  state: "Running" | "Stopped" | "Unknown" | "Creating";
  icon: string;
}

export default function DevboxNode({ data }: { data: DevboxNodeProps }) {
  const { name, type, state, icon } = data;

  return (
    <BaseNode>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <Image
            alt="Icon"
            className="rounded-lg object-contain"
            height={40}
            src={icon}
            width={40}
          />
          <div className="flex flex-col items-start">
            <span className="truncate text-muted-foreground text-sm">
              {type}
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
