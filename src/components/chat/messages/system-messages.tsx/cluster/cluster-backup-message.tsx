"use client";

import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { clusterClient } from "@/components/provider/trpc-provider";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useDeleteBackupMutation } from "@/lib/sealos/resources/cluster/cluster-method/cluster-mutation";
import { createSealosContext } from "@/lib/auth/auth-utils";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";

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
  const clusterTrpcClient = clusterClient.useTRPC();
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const sealosContext = createSealosContext();
  const deleteBackupMutation = useDeleteBackupMutation(sealosContext);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [openDeletePopovers, setOpenDeletePopovers] = useState<
    Record<string, boolean>
  >({});
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [newBackupName, setNewBackupName] = useState("");
  const [newBackupNotes, setNewBackupNotes] = useState("");

  // Fetch the backup list using the cluster router
  const {
    data: backupList,
    isLoading,
    error,
    refetch,
  } = useQuery(
    clusterTrpcClient.getClusterBackupList.queryOptions({
      target: target,
    })
  );

  const handleDeleteBackup = async (backupName: string) => {
    try {
      await deleteBackupMutation.mutateAsync({ backupName });
      setDeleteDialogOpen(null);
      setDeletePopoverOpen(backupName, false);
      // Refetch the backup list after deletion
      refetch();
    } catch (error) {
      console.error("Failed to delete backup:", error);
    }
  };

  const setDeletePopoverOpen = (backupName: string, open: boolean) => {
    setOpenDeletePopovers((prev) => ({ ...prev, [backupName]: open }));
  };

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
      <BaseActionMessage
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
      </BaseActionMessage>
    );
  }

  // Show error state
  if (error) {
    return (
      <BaseActionMessage
        headerTitle={{
          icon: DatabaseBackup,
          name: "Cluster Backup",
        }}
      >
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-destructive">
            <DatabaseBackup className="h-4 w-4" />
            <span>Failed to load backup information</span>
          </div>
        </div>
      </BaseActionMessage>
    );
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: DatabaseBackup,
        name: `Cluster Backup: ${backupList?.length}`,
      }}
    >
      <div className="space-y-4">

        {!backupList || backupList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Database className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
            <div className="text-sm text-muted-foreground">
              No backups found for this cluster
            </div>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {backupList.map((backup: Backup, index: number) => {
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
                        <button
                          className="p-1 hover:bg-muted rounded transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle restore action
                          }}
                          title="Restore backup"
                        >
                          <History className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
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
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
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
                                  onClick={() =>
                                    handleDeleteBackup(backup.name)
                                  }
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
          </ScrollArea>
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
                value={newBackupName}
                onChange={(e) => setNewBackupName(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Input
                placeholder="Notes"
                value={newBackupNotes}
                onChange={(e) => setNewBackupNotes(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Button
                size="sm"
                variant="default"
                className="h-8 w-8 p-0"
                onClick={() => {
                  console.log("Create backup:", {
                    name: newBackupName,
                    notes: newBackupNotes,
                  });
                  setIsCreatingBackup(false);
                  setNewBackupName("");
                  setNewBackupNotes("");
                }}
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
                  setNewBackupName("");
                  setNewBackupNotes("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseActionMessage>
  );
};

export default ClusterBackupMessage;
