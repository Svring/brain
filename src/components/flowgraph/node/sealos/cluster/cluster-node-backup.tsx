"use client";

import { getClusterBackupListOptions } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { useSealosContext } from "@/lib/auth/auth-utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DatabaseBackup } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ClusterNodeBackupTitle from "./cluster-node-backup-title";
import ClusterNodeBackupList from "./cluster-node-backup-list";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";

export default function ClusterNodeBackup({
  target,
}: {
  target: CustomResourceTarget;
}) {
  const sealosContext = useSealosContext();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get cluster object using resource status hook
  const { resource, isLoading: isLoadingResource } = useResourceStatus(target);
  const clusterObject = resource as ClusterObject;

  const { data: backupList, isLoading } = useQuery(
    getClusterBackupListOptions(sealosContext, target)
  );

  const { handleNodeSelect } = useNodeSelect({
    target,
    messageType: "cluster.backup",
  });

  const clusterName = clusterObject?.name || "Unknown Cluster";

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Transform the backup data to match our interface
  const transformedBackups = backupList?.map((backup) => ({
    name: backup.name,
    time: typeof backup.time === "string" ? backup.time : undefined,
  }));

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="p-1 border-2 border-muted-foreground/20 rounded-full cursor-pointer hover:border-muted-foreground/40 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNodeSelect();
            }}
          >
            <DatabaseBackup className="h-4 w-4 text-theme-green" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">View backup</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
