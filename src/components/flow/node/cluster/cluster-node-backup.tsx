"use client";

import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getClusterBackupListOptions } from "@/lib/sealos/cluster/cluster-method/cluster-query";
import { createSealosContext } from "@/lib/auth/auth-utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import BaseNode from "../base-node-wrapper";
import ClusterNodeBackupTitle from "./cluster-node-backup-title";
import ClusterNodeBackupList from "./cluster-node-backup-list";

interface ClusterNodeBackupProps {
  target: CustomResourceTarget;
  nodeData: any;
}

export default function ClusterNodeBackup({
  target,
  nodeData,
}: ClusterNodeBackupProps) {
  const sealosContext = createSealosContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: backupList, isLoading } = useQuery(
    getClusterBackupListOptions(sealosContext, target)
  );

  const clusterName = target.name || 'Unknown Cluster';

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Transform the backup data to match our interface
  const transformedBackups = backupList?.map(backup => ({
    name: backup.name,
    time: typeof backup.time === 'string' ? backup.time : undefined
  }));

  return (
    <BaseNode target={target} nodeData={nodeData} expand={isExpanded}>
      <div className="flex h-full flex-col gap-3 p-1">
        <ClusterNodeBackupTitle
          backupsCount={backupList?.length || 0}
          clusterName={clusterName}
          onToggleExpand={handleToggleExpand}
          isExpanded={isExpanded}
        />
        <ClusterNodeBackupList
          backups={transformedBackups}
          isLoading={isLoading}
        />
      </div>
    </BaseNode>
  );
}
