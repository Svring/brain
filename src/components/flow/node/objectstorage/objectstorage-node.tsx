"use client";

import BaseNode from "../base-node-wrapper";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import useObjectStorageNode from "@/hooks/sealos/objectstorage/use-objectstorage-node";
import Image from "next/image";
import ObjectStoragePolicyBadge from "./objectstorage-policy-badge";

interface ObjectStorageNodeProps {
  target: CustomResourceTarget;
}

export default function ObjectStorageNode({
  data: { target },
}: {
  data: { target: CustomResourceTarget };
}) {
  const context = createK8sContext();
  const { data, isLoading } = useObjectStorageNode(context, target);

  if (isLoading || !data) {
    return null;
  }

  const { name, policy } = data;

  return (
    <BaseNode target={target} nodeData={data}>
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="flex items-center gap-2">
              <Image
                src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg"
                alt="Object Storage Icon"
                width={24}
                height={24}
                className="rounded-lg border border-muted bg-white h-9 w-9"
                priority
              />
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground leading-none">
                  Object Storage
                </span>
                <span className="text-lg font-bold text-foreground leading-tight w-full overflow-hidden text-ellipsis text-left">
                  {name}
                </span>
              </span>
            </span>
          </div>
        </div>

        {/* Policy Badge */}
        <div className="flex justify-start">
          <ObjectStoragePolicyBadge policy={policy} />
        </div>
      </div>
    </BaseNode>
  );
}
