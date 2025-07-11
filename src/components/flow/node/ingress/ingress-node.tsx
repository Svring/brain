"use client";

import BaseNode from "../base-node";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface IngressNodeProps {
  name: string;
  host: string;
  target: BuiltinResourceTarget;
}

export default function IngressNode({ data }: { data: IngressNodeProps }) {
  const { name, host, target } = data;

  return (
    <BaseNode target={target}>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="truncate text-muted-foreground text-sm">
              Ingress
            </span>
            {/* <span className="w-40 overflow-hidden text-ellipsis text-left font-bold text-foreground text-md">
              {name}
            </span> */}
            <a
              className="w-full overflow-hidden text-left font-bold text-blue-500 text-md transition-colors hover:text-primary"
              href={`http://${host}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              {host}
            </a>
          </div>
        </div>

        {/* State badge */}
        <div className="mt-auto flex justify-start">
          {/* <span className="rounded px-2 py-0.5 text-xs">
            {host ? "Active" : "Inactive"}
          </span> */}
        </div>
      </div>
    </BaseNode>
  );
}
