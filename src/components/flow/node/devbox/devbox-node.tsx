"use client";

import { useQuery } from "@tanstack/react-query";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseNode from "../base-node-wrapper";
import Image from "next/image";
import { getDevboxOptions } from "@/lib/sealos/devbox/devbox-method/devbox-query";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";
import { DevboxNodeDataSchema } from "@/lib/sealos/devbox/schemas/devbox-node-schemas";
import useDevboxNode from "@/hooks/sealos/devbox/use-devbox-node";

export default function DevboxNode({
  data: { target },
}: {
  data: { target: CustomResourceTarget };
}) {
  // Extract devbox name from target
  const devboxName = target.name || "";
  // Create devbox API context
  const devboxContext = createDevboxContext();

  useDevboxNode(target);

  // Fetch devbox data
  const { data: devboxResource } = useQuery(
    getDevboxOptions(devboxContext, devboxName)
  );

  // Extract data from resource or provide fallbacks
  const name = devboxName;

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
