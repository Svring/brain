"use client";

import BaseNode from "../base-node-wrapper";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import Image from "next/image";

interface ObjectStorageNodeProps {
  target: CustomResourceTarget;
}

export default function ObjectStorageNode({
  data,
}: {
  data: ObjectStorageNodeProps;
}) {
  const { target } = data;

  // Extract object storage name from target
  const name = target.name || "Object Storage";

  return (
    <BaseNode target={target} nodeData={{}}>
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
      </div>
    </BaseNode>
  );
}
