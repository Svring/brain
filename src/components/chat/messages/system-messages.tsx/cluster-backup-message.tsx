import React from "react";
import { Database, Clock, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-black rounded-full"></div>
          <div className="flex-1">
            <CardTitle className="text-lg">Backups for {clusterName}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Database Cluster</span>
            </div>
          </div>
          <Badge variant="outline">
            {backups.length} backup{backups.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Backups List */}
        {backups.length > 0 ? (
          <div className="space-y-3">
            {backups.map((backup, index) => (
              <Card key={backup.name || index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
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
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Database className="h-8 w-8 text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground">No backups available</div>
            <div className="text-xs text-muted-foreground mt-1">Create your first backup to get started</div>
          </div>
        )}

        {/* Backup Info */}
        <Separator />
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Backup Information</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Backups are automatically created based on your cluster configuration</p>
            <p>• You can restore from any available backup point</p>
            <p>• Deleted backups cannot be recovered</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClusterBackupMessageCard;
