"use client";

import { useState } from "react";
import BaseNode from "../base-node-wrapper";
import { NodeToolbar, Position } from "@xyflow/react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/cluster/cluster-constant";
import { CLUSTER_DEFINITION_LABEL_KEY } from "@/lib/sealos/cluster/cluster-constant";
import { Link } from "lucide-react";
import { useClusterSecret } from "@/lib/sealos/cluster/cluster-method/cluster-query";
import { extractClusterCredentials } from "@/lib/sealos/cluster/cluster-utils";
import { useQuery } from "@tanstack/react-query";
import { getCustomResourceOptions } from "@/lib/k8s/k8s-method/k8s-query";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import type { ClusterResource } from "@/lib/k8s/schemas/resource-schemas/cluster-schemas";

interface ClusterNodeProps {
  target: CustomResourceTarget;
}

interface ClusterNodeData {
  name: string;
  type: string;
  version: string;
  connection: {
    privateConnectionString: string;
    publicConnectionString: string;
  };
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  monitor: {
    cpu: string;
    memory: string;
    storage: string;
  };
  env: {
    name: string;
    value: string;
  }[];
  backup: {
    type: string;
    storage: string;
  }[];
  pods: {
    name: string;
  }[];
}

export default function ClusterNode({ data }: { data: ClusterNodeProps }) {
  const { target } = data;
  const [showConnectionMenu, setShowConnectionMenu] = useState(false);

  // Extract cluster name from target
  const clusterName = target.name || "";

  // Fetch cluster resource data
  const k8sContext = createK8sContext();
  const clusterQuery = useQuery({
    ...getCustomResourceOptions(k8sContext, {
      ...CUSTOM_RESOURCES.cluster,
      name: clusterName,
    }),
    enabled: !!clusterName,
  });

  const clusterResource = clusterQuery.data as ClusterResource | undefined;
  const name = clusterResource?.metadata.name || clusterName;
  const state = clusterResource?.status?.phase || "Unknown";
  const clusterType =
    clusterResource?.metadata.labels?.[CLUSTER_DEFINITION_LABEL_KEY] || "";

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
