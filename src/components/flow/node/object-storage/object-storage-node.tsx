"use client";

import { useState } from "react";
import BaseNode from "../base-node-wrapper";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Link } from "lucide-react";
import { useObjectStorageSecret } from "@/lib/sealos/objectstorage/objectstorage-query";
import { extractObjectStorageCredentials } from "@/lib/sealos/objectstorage/objectstorage-utils";

interface ObjectStorageNodeProps {
  name: string;
  policy: string;
  target: CustomResourceTarget;
}

export default function ObjectStorageNode({
  data,
}: {
  data: ObjectStorageNodeProps;
}) {
  const { name, policy, target } = data;
  const [showConnectionMenu, setShowConnectionMenu] = useState(false);

  // Fetch object storage secret
  const objectStorageSecretQuery = useObjectStorageSecret(name);

  const handleAddConnection = () => {
    setShowConnectionMenu(true);
  };

  const floatingMenuOptions = [
    {
      label: "Add connection",
      onClick: handleAddConnection,
      Icon: <Link className="w-4 h-4" />,
    },
  ];

  return (
    <BaseNode
      target={target}
      showDefaultMenu={!showConnectionMenu}
      floatingMenuOptions={floatingMenuOptions}
      onShowConnectionMenu={setShowConnectionMenu}
      showConnectionMenu={showConnectionMenu}
      objectStorageName={name}
    >
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
                <span className="text-lg font-bold text-foreground leading-tight w-40 overflow-hidden text-ellipsis text-left">
                  {name}
                </span>
              </span>
            </span>
          </div>
        </div>

        {/* Policy badge */}
        <div className="mt-auto flex justify-start">
          <Badge variant="outline">{policy}</Badge>
        </div>
      </div>
    </BaseNode>
  );
}
