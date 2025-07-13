"use client";

import BaseNode from "../base-node-wrapper";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface StatefulSetNodeProps {
  name: string;
  readyReplicas: number;
  replicas: number;
  target: BuiltinResourceTarget;
}

export default function StatefulSetNode({
  data,
}: {
  data: StatefulSetNodeProps;
}) {
  const { name, readyReplicas, replicas, target } = data;

  return (
    <BaseNode target={target}>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="flex items-center gap-2">
              <Image
                src="https://applaunchpad.bja.sealos.run/logo.svg"
                alt="StatefulSet Icon"
                width={24}
                height={24}
                className="rounded-lg border border-muted bg-white h-9 w-9"
                priority
              />
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground leading-none">
                  Stateful Set
                </span>
                <span className="text-lg font-bold text-foreground leading-tight w-40 overflow-hidden text-ellipsis text-left">
                  {name}
                </span>
              </span>
            </span>
          </div>
        </div>

        {/* State badge */}
        <div className="mt-auto flex justify-start">
          <Badge
            variant="outline"
            className={
              readyReplicas === replicas && replicas > 0
                ? "border-green-600 text-green-700"
                : ""
            }
          >
            {readyReplicas === replicas && replicas > 0
              ? "Running"
              : "Preparing"}
          </Badge>
        </div>
      </div>
    </BaseNode>
  );
}
