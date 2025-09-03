"use client";

import { Database, Clock, History, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { useDeleteBackupMutation } from "@/lib/sealos/resources/cluster/cluster-method/cluster-mutation";
import { useSealosContext } from "@/lib/auth/auth-utils";
import { useState } from "react";

interface Backup {
  name: string;
  time?: string;
}

interface ClusterNodeBackupListProps {
  backups: Backup[] | undefined;
  isLoading: boolean;
  isExpanded?: boolean;
}

export default function ClusterNodeBackupList({
  backups,
  isLoading,
  isExpanded = false,
}: ClusterNodeBackupListProps) {
  const sealosContext = useSealosContext();
  const deleteBackupMutation = useDeleteBackupMutation(sealosContext);
  
  const [openDeletePopovers, setOpenDeletePopovers] = useState<
    Record<string, boolean>
  >({});

  const handleDeleteBackup = async (backupName: string) => {
    console.log("Attempting to delete backup:", backupName);
    try {
      const result = await deleteBackupMutation.mutateAsync({ backupName });
      console.log("Delete backup result:", result);
      // Close popover after successful deletion
      setDeletePopoverOpen(backupName, false);
    } catch (error) {
      console.error("Failed to delete backup:", error);
    }
  };

  const setDeletePopoverOpen = (backupName: string, open: boolean) => {
    setOpenDeletePopovers((prev) => ({ ...prev, [backupName]: open }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollArea className={`flex-1 ${!isExpanded ? "overflow-hidden" : ""}`}>
      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <div className="text-xs text-muted-foreground">Loading...</div>
        </div>
      ) : backups && backups.length > 0 ? (
        <div className="space-y-2">
          {backups.map((backup, index) => {
            const backupTime =
              backup.time && typeof backup.time === "string"
                ? new Date(backup.time)
                : null;
            const isValidTime = backupTime && !isNaN(backupTime.getTime());

            return (
              <div
                key={backup.name || index}
                className="border rounded-lg p-2 hover:bg-muted/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-3 w-3 text-muted-foreground" />
                    <div className="flex flex-col max-w-[120px]">
                      <span className="text-xs font-medium truncate">
                        {backup.name}
                      </span>
                      {backup.time && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">
                            {formatDate(backup.time)}
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
                      onOpenChange={(open) => setDeletePopoverOpen(backup.name, open)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-destructive">
                              Delete Backup
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Are you sure you want to delete backup {backup.name}? This action cannot be undone.
                            </p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeletePopoverOpen(backup.name, false);
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                  await handleDeleteBackup(backup.name);
                                  // Popover will be closed in handleDeleteBackup
                                } catch (error) {
                                  console.error("Delete failed:", error);
                                }
                              }}
                              variant="destructive"
                              size="sm"
                              disabled={deleteBackupMutation.isPending}
                            >
                              {deleteBackupMutation.isPending ? "Deleting..." : "Delete"}
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
      ) : (
        <div className="flex flex-col items-center justify-center h-20 text-center">
          <Database className="h-6 w-6 text-muted-foreground mb-2" />
          <div className="text-xs text-muted-foreground">No backups yet</div>
        </div>
      )}
    </ScrollArea>
  );
}
