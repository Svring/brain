"use client";

import { useState } from "react";
import BaseNode from "../base-node-wrapper";
import { NodeToolbar, Position } from "@xyflow/react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { ClusterResource } from "@/lib/k8s/schemas/resource-schemas/cluster-schemas";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/cluster/cluster-constant";
import { CLUSTER_DEFINITION_LABEL_KEY } from "@/lib/sealos/cluster/cluster-constant";
import { Link } from "lucide-react";
import { useClusterSecret } from "@/lib/sealos/cluster/cluster-method/cluster-query";
import { extractClusterCredentials } from "@/lib/sealos/cluster/cluster-utils";

interface ClusterNodeProps {
  name: string;
  state: string;
  target: CustomResourceTarget;
  resource: ClusterResource;
}

export default function ClusterNode({ data }: { data: ClusterNodeProps }) {
  const { name, state, target, resource } = data;
  const [showConnectionMenu, setShowConnectionMenu] = useState(false);
  const clusterType =
    resource.metadata.labels?.[CLUSTER_DEFINITION_LABEL_KEY] ?? "";

  // Fetch cluster secret
  const clusterSecretQuery = useClusterSecret(name);

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
      clusterName={name}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Name */}
        <div className="flex items-center gap-2 truncate font-medium">
          <div className="flex flex-col items-start">
            <span className="flex items-center gap-2">
              <Image
                src={CLUSTER_TYPE_ICON_MAP[clusterType] ?? ""}
                alt={clusterType}
                width={24}
                height={24}
                className="rounded-lg h-9 w-9"
                priority
              />
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground leading-none">
                  Database
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
              typeof state === "string" && state.toLowerCase() === "running"
                ? "border-green-600 text-green-700"
                : ""
            }
          >
            {state}
          </Badge>
        </div>
      </div>
    </BaseNode>
  );
}
