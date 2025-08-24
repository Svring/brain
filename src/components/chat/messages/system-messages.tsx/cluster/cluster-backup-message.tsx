"use client";

import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { clusterClient } from "@/components/provider/trpc-provider";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/message-actions";
import { DatabaseBackup, RefreshCw, Trash2 } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useDeleteBackupMutation } from "@/lib/sealos/resources/cluster/cluster-method/cluster-mutation";
import { createSealosContext } from "@/lib/auth/auth-utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClusterBackupMessageProps {
  target: CustomResourceTarget;
}

interface Backup {
  name: string;
  time?: unknown;
}

export const ClusterBackupMessage: React.FC<ClusterBackupMessageProps> = ({ target }) => {
  const clusterTrpcClient = clusterClient.useTRPC();
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const sealosContext = createSealosContext();
  const deleteBackupMutation = useDeleteBackupMutation(sealosContext);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

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
      // Refetch the backup list after deletion
      refetch();
    } catch (error) {
      console.error("Failed to delete backup:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  const actions: MessageAction[] = [
    {
      icon: RefreshCw,
      label: "Refresh",
      onClick: () => {
        refetch();
      },
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={target} actions={actions}>
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
      <BaseSystemMessage target={target} actions={actions}>
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
    <BaseSystemMessage target={target} actions={actions}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DatabaseBackup className="h-5 w-5 text-theme-green" />
          <h3 className="font-semibold">Cluster Backups</h3>
        </div>

        {!backupList || backupList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DatabaseBackup className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No backups found for this cluster</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {backupList.map((backup: Backup, index: number) => {
                const backupTime = backup.time && typeof backup.time === "string" 
                  ? new Date(backup.time) 
                  : null;
                const isValidTime = backupTime && !isNaN(backupTime.getTime());

                return (
                  <div
                    key={backup.name || index}
                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <DatabaseBackup className="h-4 w-4 text-theme-green flex-shrink-0" />
                          <span className="font-medium truncate">{backup.name}</span>
                        </div>
                                                 {isValidTime && (
                           <div className="text-sm text-muted-foreground mt-1">
                             Created {formatDate(backup.time as string)}
                           </div>
                         )}
                      </div>
                      
                      <AlertDialog open={deleteDialogOpen === backup.name} onOpenChange={(open) => setDeleteDialogOpen(open ? backup.name : null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the backup "{backup.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBackup(backup.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
