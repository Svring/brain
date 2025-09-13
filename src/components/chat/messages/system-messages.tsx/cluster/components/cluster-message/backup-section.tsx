"use client";

import React from "react";
import { DatabaseBackup, Database } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useClusterBackup } from "@/hooks/sealos/cluster/use-cluster-backup";

interface BackupSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// Backup Popover Content Component
export const BackupPopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  const {
    backups,
    isLoading,
    isCreatingBackup,
    backupConfig,
    openDeletePopovers,
    deleteBackupMutation,
    handleCreateBackup,
    handleDeleteBackup,
    setDeletePopoverOpen,
    setIsCreatingBackup,
    setBackupConfig,
    resetBackupConfig,
  } = useClusterBackup(target);

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full rounded-lg">
      <div className="space-y-3">
        {backups && backups.length > 0 && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Backups: {backups.length}</h3>
          </div>
        )}

        {!backups || backups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-center">
            <Database className="h-6 w-6 text-muted-foreground mb-2" />
            <div className="text-xs text-muted-foreground">No backups yet</div>
          </div>
        ) : (
          <div
            className={`space-y-2 ${
              backups.length > 3 ? "max-h-48 overflow-y-auto" : ""
            }`}
          >
            {backups.map((backup: any, index: number) => {
              const backupTime =
                backup.time && typeof backup.time === "string"
                  ? new Date(backup.time)
                  : null;
              const isValidTime = backupTime && !isNaN(backupTime.getTime());

              return (
                <div
                  key={backup.name || index}
                  className="border rounded-lg p-2 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-3 w-3 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium truncate">
                          {backup.name}
                        </span>
                        {isValidTime && (
                          <span className="text-xs text-muted-foreground">
                            {formatShortDate(backup.time as string)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const BackupSection: React.FC<BackupSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { backups } = useClusterBackup(target);
  const backupsCount = backups?.length || 0;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <DatabaseBackup className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Backup</span>
          <span className="text-xs text-muted-foreground">
            {backupsCount} backups
          </span>
        </div>
      </div>
    </div>
  );
};

export default BackupSection;
