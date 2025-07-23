"use client";

import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseNode from "../base-node-wrapper";
import Image from "next/image";
import useDevboxNode from "@/hooks/sealos/devbox/use-devbox-node";
import { Badge } from "@/components/ui/badge";

export default function DevboxNode({
  data: { target },
}: {
  data: { target: CustomResourceTarget };
}) {
  const { nodeData, isLoading } = useDevboxNode(target);

  if (isLoading || !nodeData) {
    return null;
  }

  return (
    <BaseNode target={target} nodeData={nodeData}>
      <div className="flex h-full flex-col justify-between">
        {/* Name and Status */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start w-full">
            <span className="flex items-center gap-2 w-full">
              <Image
                src="https://devbox.bja.sealos.run/logo.svg"
                alt="Devbox Icon"
                width={24}
                height={24}
                className="rounded-lg border border-muted h-9 w-9"
                priority
              />
              <span className="flex flex-col flex-1">
                <span className="text-xs text-muted-foreground leading-none">
                  Devbox
                </span>
                <span className="text-lg font-bold text-foreground leading-tight w-full overflow-hidden text-ellipsis text-left">
                  {nodeData.name}
                </span>
              </span>
            </span>

            {/* Image Information */}
            <div className="mt-2 w-full flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Image:</span>
              <span
                className="text-sm text-foreground truncate w-full"
                title={nodeData.image}
              >
                {nodeData.image}
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
