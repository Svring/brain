"use client";

import { Database, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface Backup {
  name: string;
  time?: string;
}

interface ClusterNodeBackupListProps {
  backups: Backup[] | undefined;
  isLoading: boolean;
}

export default function ClusterNodeBackupList({
  backups,
  isLoading,
}: ClusterNodeBackupListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollArea className="flex-1">
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
                    <div className="flex flex-col">
                      <span className="text-xs font-medium truncate">
                        {backup.name}
                      </span>
                      {isValidTime ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">
                            {formatDistanceToNow(backupTime, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      ) : (
                        backup.time && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(backup.time)}
                          </span>
                        )
                      )}
                    </div>
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