import React from "react";
import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

interface ClusterInfoHeaderProps {
  clusterData: ClusterObject;
}

export const ClusterInfoHeader: React.FC<ClusterInfoHeaderProps> = ({
  clusterData,
}) => {
  const iconUrl = CLUSTER_TYPE_ICON_MAP[clusterData.type as keyof typeof CLUSTER_TYPE_ICON_MAP];
  
  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "default";
      case "updating":
        return "secondary";
      case "stopped":
        return "outline";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <CardHeader className="">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Image
              src={iconUrl || "https://dbprovider.bja.sealos.run/logo.svg"}
              alt={`${clusterData.type} Icon`}
              width={24}
              height={24}
              className="rounded-lg h-9 w-9 flex-shrink-0"
              priority
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {clusterData.type.charAt(0).toUpperCase() + clusterData.type.slice(1)}
                </span>
                {clusterData.status && (
                  <Badge variant={getStatusVariant(clusterData.status)}>
                    {clusterData.status}
                  </Badge>
                )}
              </div>
              <span className="text-lg font-bold text-foreground leading-tight truncate">
                {clusterData.name}
              </span>
            </div>
          </div>
        </div>
        <Badge>{clusterData.status}</Badge>
      </div>

      {/* Created At and Replicas Info */}
      <div className="grid grid-cols-2 gap-6 pt-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Created At</span>
          <span className="text-sm font-medium">
            {clusterData.operationalStatus?.createdAt}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Replicas</span>
          <span className="text-sm font-medium">
            {clusterData.resource?.replicas || "N/A"}
          </span>
        </div>
      </div>
    </CardHeader>
  );
};
