"use client";

import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseNode from "../base-node-wrapper";
import Image from "next/image";

interface DevboxNodeProps {
  name: string;
  target: CustomResourceTarget;
}

export default function DevboxNode({ data }: { data: DevboxNodeProps }) {
  const { name, target } = data;

  return (
    <BaseNode target={target}>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="flex items-center gap-2">
              <Image
                src="https://devbox.bja.sealos.run/logo.svg"
                alt="Devbox Icon"
                width={24}
                height={24}
                className="rounded-lg border border-muted bg-white h-9 w-9"
                priority
              />
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground leading-none">
                  Devbox
                </span>
                <span className="text-lg font-bold text-foreground leading-tight w-40 overflow-hidden text-ellipsis text-left">
                  {name}
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
