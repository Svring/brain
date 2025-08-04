"use client";

import { Database, Clock, History, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useDeleteBackupMutation } from "@/lib/sealos/cluster/cluster-method/cluster-mutation";
import { createSealosContext } from "@/lib/auth/auth-utils";

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
  const sealosContext = createSealosContext();
  const deleteBackupMutation = useDeleteBackupMutation(sealosContext);

  const handleDeleteBackup = async (backupName: string) => {
    console.log('Attempting to delete backup:', backupName);
    try {
      const result = await deleteBackupMutation.mutateAsync({ backupName });
      console.log('Delete backup result:', result);
    } catch (error) {
      console.error('Failed to delete backup:', error);
    }
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
                    <button
                      className={`p-1 hover:bg-muted rounded transition-colors ${
                        deleteBackupMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Delete button clicked for:', backup.name);
                        handleDeleteBackup(backup.name);
                      }}
                      title="Delete backup"
                      disabled={deleteBackupMutation.isPending}
                    >
                      <Trash2 className={`h-3 w-3 ${
                        deleteBackupMutation.isPending 
                          ? 'text-muted-foreground/50' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`} />
                    </button>
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
