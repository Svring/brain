"use client";

import React, { useState } from "react";
import {
  DatabaseBackup,
  Database,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  X,
} from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useClusterBackup } from "@/hooks/sealos/cluster/use-cluster-backup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface BackupSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// Backup Popover Content Component
export const BackupPopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newBackupNotes, setNewBackupNotes] = useState("");
  const [restoringBackup, setRestoringBackup] = useState<string | null>(null);

  const {
    backups,
    isCreatingBackup,
    deleteBackupMutation,
    restoreBackupMutation,
    handleCreateBackup,
    handleDeleteBackup,
    handleRestoreBackup,
  } = useClusterBackup(target);

  console.log("backups", backups);

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreateNewBackup = async () => {
    try {
      await handleCreateBackup({
        name: "", // Name is not required, will be auto-generated
        notes: newBackupNotes.trim(),
      });
      setNewBackupNotes("");
      setIsCreating(false);
      toast.success("Backup created successfully");
    } catch (error) {
      toast.error("Failed to create backup");
    }
  };

  const handleDeleteBackupClick = async (backupName: string) => {
    try {
      await handleDeleteBackup(backupName);
      toast.success("Backup deleted successfully");
    } catch (error) {
      toast.error("Failed to delete backup");
    }
  };

  const handleRestoreBackupClick = async (backupName: string) => {
    try {
      setRestoringBackup(backupName);
      await handleRestoreBackup(backupName);
      setRestoringBackup(null);
      toast.success("Backup restored successfully");
    } catch (error) {
      setRestoringBackup(null);
      toast.error("Failed to restore backup");
    }
  };

  return (
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
          {Array.isArray(backups) &&
            backups.map((backup: any, index: number) => {
              const backupTime =
                backup.createdAt && typeof backup.createdAt === "string"
                  ? new Date(backup.createdAt)
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
                            {formatShortDate(backup.createdAt as string)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-0 border border-border-primary bg-background-tertiary hover:brightness-150"
                        onClick={() => handleRestoreBackupClick(backup.name)}
                        disabled={
                          restoreBackupMutation.isPending ||
                          restoringBackup === backup.name
                        }
                        title="Restore backup"
                      >
                        {restoringBackup === backup.name ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        Restore
                      </Button>
                      <Button
                        variant="destructive"
                        className="p-0 h-8 w-8 hover:text-destructive"
                        onClick={() => handleDeleteBackupClick(backup.name)}
                        disabled={deleteBackupMutation.isPending}
                        title="Delete backup"
                      >
                        {deleteBackupMutation.isPending ? (
                          <Spinner className="h-3 w-3" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Add new backup section - fixed at bottom */}
      {!isCreating ? (
        <div
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
          onClick={() => setIsCreating(true)}
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
              placeholder="Notes (optional)"
              value={newBackupNotes}
              onChange={(e) => setNewBackupNotes(e.target.value)}
              className="h-8 text-xs flex-1"
            />
            <Button
              size="sm"
              variant="default"
              className="h-8 w-8 p-0"
              onClick={handleCreateNewBackup}
              disabled={isCreatingBackup}
              title="Create backup"
            >
              {isCreatingBackup ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                setIsCreating(false);
                setNewBackupNotes("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
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
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors w-full min-w-0"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2 min-w-0">
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
