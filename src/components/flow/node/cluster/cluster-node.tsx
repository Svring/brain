"use client";

import BaseNode from "../base-node-wrapper";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/cluster/cluster-constant";
import useClusterNode from "@/hooks/sealos/cluster/use-cluster-node";
import { createK8sContext } from "@/lib/auth/auth-utils";

export default function ClusterNode({
  data: { target },
}: {
  data: { target: CustomResourceTarget };
}) {
  const context = createK8sContext();
  const { data, isLoading } = useClusterNode(context, target);

  if (isLoading) {
    return null;
  }

  return (
    <BaseNode target={target} nodeData={data}>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="flex items-center gap-2">
              <Image
                src={CLUSTER_TYPE_ICON_MAP[data.type] ?? ""}
                alt={data.type}
                width={24}
                height={24}
                className="rounded-lg h-9 w-9"
                priority
              />
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground leading-none">
                  {data.type}
                </span>
                <span className="text-lg font-bold text-foreground leading-tight w-full overflow-hidden text-ellipsis text-left">
                  {data.name}
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
              typeof data.status === "string" &&
              data.status.toLowerCase() === "running"
                ? "border-green-600 text-green-700"
                : ""
            }
          >
            {data.status}
          </Badge>
        </div>
      </div>
    </BaseNode>
  );
}
