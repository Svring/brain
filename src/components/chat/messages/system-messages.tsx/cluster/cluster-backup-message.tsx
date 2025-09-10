"use client";

import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseSystemMessage from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import {
  DatabaseBackup,
  Plus,
  Trash2,
  Database,
  Clock,
  History,
  Check,
  X,
} from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useClusterBackup } from "@/hooks/sealos/cluster/use-cluster-backup";

interface ClusterBackupMessageProps {
  target: CustomResourceTarget;
}

interface Backup {
  name: string;
  time?: unknown;
}

export const ClusterBackupMessage: React.FC<ClusterBackupMessageProps> = ({
  target,
}) => {
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  
  // Use the cluster backup hook
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

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage
        headerTitle={{
          icon: DatabaseBackup,
          name: "Cluster Backup",
        }}
      >
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Spinner variant="bars" className="h-4 w-4" />
            <span>Loading backup information...</span>
          </div>
        </div>
      </BaseSystemMessage>
    );
  }


  return (
    <BaseSystemMessage
      headerTitle={{
        icon: DatabaseBackup,
        name: `Cluster Backup: ${backups?.length}`,
      }}
    >
      <div className="space-y-4">
        {!backups || backups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Database className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
            <div className="text-sm text-muted-foreground">
              No backups found for this cluster
            </div>
          </div>
        ) : (
          <div
            className={`space-y-2 ${
              backups.length > 3 ? "max-h-48 overflow-y-auto" : ""
            }`}
          >
            {backups.map((backup: Backup, index: number) => {
              const backupTime =
                backup.time && typeof backup.time === "string"
                  ? new Date(backup.time)
                  : null;
              const isValidTime = backupTime && !isNaN(backupTime.getTime());

              return (
                <div
                  key={backup.name || index}
                  className="border rounded-lg p-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-3 w-3 text-muted-foreground" />
                      <div className="flex flex-col max-w-[200px]">
                        <span className="text-sm font-medium truncate">
                          {backup.name}
                        </span>
                        {isValidTime && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">
                              {formatShortDate(backup.time as string)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-0 border border-border-primary bg-background-tertiary hover:brightness-150"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle restore action
                        }}
                        title="Restore backup"
                      >
                        <History className="h-4 w-4" />
                        Restore
                      </Button>
                      <Popover
                        open={openDeletePopovers[backup.name] || false}
                        onOpenChange={(open) =>
                          setDeletePopoverOpen(backup.name, open)
                        }
                      >
                        <PopoverTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-0 text-destructive hover:text-destructive"
                            disabled={deleteBackupMutation.isPending}
                            title="Delete backup"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-80 z-[9999] bg-background-secondary"
                          side="top"
                        >
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-destructive">
                                Delete Backup
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Are you sure you want to delete backup{" "}
                                {backup.name}? This action cannot be undone.
                              </p>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() =>
                                  setDeletePopoverOpen(backup.name, false)
                                }
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleDeleteBackup(backup.name)}
                                variant="destructive"
                                size="sm"
                                disabled={deleteBackupMutation.isPending}
                              >
                                {deleteBackupMutation.isPending
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add new backup section */}
        {!isCreatingBackup ? (
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
            onClick={() => setIsCreatingBackup(true)}
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Add new backup
              </span>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Backup name"
                value={backupConfig.name}
                onChange={(e) => setBackupConfig({ ...backupConfig, name: e.target.value })}
                className="h-8 text-xs flex-1"
              />
              <Input
                placeholder="Notes"
                value={backupConfig.notes}
                onChange={(e) => setBackupConfig({ ...backupConfig, notes: e.target.value })}
                className="h-8 text-xs flex-1"
              />
              <Button
                size="sm"
                variant="default"
                className="h-8 w-8 p-0"
                onClick={() => {
                  if (backupConfig.name.trim()) {
                    handleCreateBackup(backupConfig);
                  }
                }}
                disabled={!backupConfig.name.trim()}
                title="Create backup"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setIsCreatingBackup(false);
                  resetBackupConfig();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseSystemMessage>
  );
};

export default ClusterBackupMessage;
