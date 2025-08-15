import React from "react";
import { Database, Clock, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface Backup {
  name: string;
  time?: string;
}

interface ClusterBackupMessageProps {
  payload: {
    backups?: Backup[];
    clusterName?: string;
  };
}

export const ClusterBackupMessageCard: React.FC<ClusterBackupMessageProps> = ({
  payload,
}) => {
  const { backups = [], clusterName = "Unknown Cluster" } = payload;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <h3 className="font-semibold text-green-900 text-lg">Backups for {clusterName}</h3>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {backups.length} backup{backups.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Backups List */}
      {backups.length > 0 ? (
        <div className="space-y-3">
          {backups.map((backup, index) => (
            <div key={backup.name || index} className="bg-white p-3 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-green-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-green-900">
                      {backup.name}
                    </span>
                    {backup.time && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          {formatDate(backup.time)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    title="Restore backup"
                  >
                    <History className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                    title="Delete backup"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Database className="h-8 w-8 text-green-400 mb-2" />
          <div className="text-sm text-green-600">No backups available</div>
          <div className="text-xs text-green-500 mt-1">Create your first backup to get started</div>
        </div>
      )}
    </div>
  );
};

export default ClusterBackupMessageCard;
