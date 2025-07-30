"use client";

import BaseNode from "../base-node-wrapper";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { createK8sContext } from "@/lib/auth/auth-utils";
import useStatefulSetNode from "@/hooks/sealos/statefulset/use-statefulset-node";
import { GlobeLock, Activity, Package, Square } from "lucide-react";

export default function StatefulSetNode({
  data: { target },
}: {
  data: { target: BuiltinResourceTarget };
}) {
  const k8sContext = createK8sContext();
  const { data, isLoading } = useStatefulSetNode(k8sContext, target);

  if (isLoading) {
    return null;
  }

  console.log("data", data);

  const { name, image, status, containers } = data;

  return (
    <BaseNode target={target} nodeData={data}>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="flex items-center gap-2">
              <Image
                src="https://applaunchpad.bja.sealos.run/logo.svg"
                alt="Deploy Icon"
                width={24}
                height={24}
                className="rounded-lg border border-muted bg-white h-9 w-9"
                priority
              />
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground leading-none">
                  App Launchpad
                </span>
                <span className="text-lg font-bold text-foreground leading-tight w-40 overflow-hidden text-ellipsis text-left">
                  {name}
                </span>
              </span>
            </span>
          </div>
        </div>

        {/* Image with Package Icon */}
        <div className="flex items-center gap-2 mt-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-sm text-muted-foreground truncate">
              {containers?.[0]?.image || "No image"}
            </div>
          </div>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Square icon with status */}
          <div className="flex items-center gap-2">
            <Square className="h-4 w-4 text-muted-foreground" />
            <Badge
              variant="outline"
              className={
                status.readyReplicas === status.replicas && status.replicas > 0
                  ? "border-green-600 text-green-700"
                  : ""
              }
            >
              {status.readyReplicas === status.replicas && status.replicas > 0
                ? "running"
                : "preparing"}
            </Badge>
          </div>

          {/* Right: GlobeLock and Activity icons */}
          <div className="flex items-center gap-2">
            <GlobeLock className="h-4 w-4 text-muted-foreground" />
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
