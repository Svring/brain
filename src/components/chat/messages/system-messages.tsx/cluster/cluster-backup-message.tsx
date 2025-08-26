"use client";

import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { clusterClient } from "@/components/provider/trpc-provider";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import {
  DatabaseBackup,
  Plus,
  Trash2,
  Database,
  Clock,
  History,
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
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DatabaseBackup className="h-4 w-4 animate-spin" />
            <span>Loading backup information...</span>
          </div>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-destructive">
            <DatabaseBackup className="h-4 w-4" />
            <span>Failed to load backup information</span>
          </div>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage target={target}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Backups: {backupList?.length || 0}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-7 w-7 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

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
                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
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
      </div>
    </BaseSystemMessage>
  );
};

export default ClusterBackupMessage;
