"use client";

import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getClusterBackupListOptions } from "@/lib/sealos/cluster/cluster-method/cluster-query";
import { createSealosContext } from "@/lib/auth/auth-utils";
import { useQuery } from "@tanstack/react-query";
import { Clock, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import BaseNode from "../base-node-wrapper";

interface ClusterNodeBackupProps {
  target: CustomResourceTarget;
  nodeData: any;
}

export default function ClusterNodeBackup({
  target,
  nodeData,
}: ClusterNodeBackupProps) {
  const sealosContext = createSealosContext();

  const { data: backupList, isLoading } = useQuery(
    getClusterBackupListOptions(sealosContext, target)
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading backups...</div>
      </div>
    );
  }

  if (!backupList || backupList.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Database className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">No backups found</div>
      </div>
    );
  }

  return (
    <BaseNode target={target} nodeData={nodeData}>
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span className="text-sm font-medium">Cluster Backups</span>
          <span className="text-xs text-muted-foreground">
            ({backupList.length})
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {backupList.map((backup, index) => {
              const backupTime =
                backup.time && typeof backup.time === "string"
                  ? new Date(backup.time)
                  : null;
              const isValidTime = backupTime && !isNaN(backupTime.getTime());

              return (
                <div
                  key={backup.name || index}
                  className="flex items-center justify-between rounded-md border p-2 text-xs"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium truncate">{backup.name}</span>
                    {isValidTime && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(backupTime, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
