"use client";

import BaseNode from "../base-node-wrapper";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { createK8sContext } from "@/lib/auth/auth-utils";
import useStatefulSetNode from "@/hooks/sealos/statefulset/use-statefulset-node";

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
              data.status.readyReplicas === data.status.replicas &&
              data.status.replicas > 0
                ? "border-green-600 text-green-700"
                : ""
            }
          >
            {data.status.readyReplicas === data.status.replicas &&
            data.status.replicas > 0
              ? "running"
              : "preparing"}
          </Badge>
        </div>
      </div>
    </BaseNode>
  );
}
