import { useState } from "react";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface BackupConfig {
  name: string;
  notes: string;
}

export const useClusterBackup = (target: CustomResourceTarget) => {
  const { cluster } = useTRPCClients();

  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    name: "",
    notes: "",
  });
  const [openDeletePopovers, setOpenDeletePopovers] = useState<
    Record<string, boolean>
  >({});
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const deleteBackupMutation = useMutation(
    cluster.deleteBackup.mutationOptions()
  );
  const createBackupMutation = useMutation(
    cluster.createBackup.mutationOptions()
  );
  const restoreBackupMutation = useMutation(
    cluster.restoreBackup.mutationOptions()
  );

  // Fetch cluster backups
  const {
    data: backups,
    isLoading,
    refetch,
  } = useQuery(cluster.backups.queryOptions(target));

  const handleCreateBackup = async (config: BackupConfig) => {
    try {
      await createBackupMutation.mutateAsync({
        databaseName: target.name!,
        remark: config.notes,
      });

      setIsCreatingBackup(false);
      setBackupConfig({ name: "", notes: "" });

      // Refetch the backup list after creation
      refetch();
    } catch (error) {
      console.error("Create backup failed:", error);
      throw error;
    }
  };

  const handleDeleteBackup = async (backupName: string) => {
    try {
      await deleteBackupMutation.mutateAsync({
        clusterName: target.name!,
        backupName,
      });
      setDeletePopoverOpen(backupName, false);

      // Refetch the backup list after deletion
      refetch();
    } catch (error) {
      console.error("Delete backup failed:", error);
      throw error;
    }
  };

  const handleRestoreBackup = async (backupName: string, newDbName: string) => {
    try {
      await restoreBackupMutation.mutateAsync({
        databaseName: target.name!,
        backupName,
        newDbName,
      });

      // Refetch the backup list after restore
      refetch();
    } catch (error) {
      console.error("Restore backup failed:", error);
      throw error;
    }
  };

  const setDeletePopoverOpen = (backupName: string, open: boolean) => {
    setOpenDeletePopovers((prev) => ({ ...prev, [backupName]: open }));
  };

  const resetBackupConfig = () => {
    setBackupConfig({ name: "", notes: "" });
  };

  return {
    // State
    backupConfig,
    openDeletePopovers,
    isCreatingBackup,

    // Data
    backups,
    isLoading,

    // Mutations
    deleteBackupMutation,
    createBackupMutation,
    restoreBackupMutation,

    // Actions
    handleCreateBackup,
    handleDeleteBackup,
    handleRestoreBackup,
    setDeletePopoverOpen,
    setIsCreatingBackup,
    setBackupConfig,
    resetBackupConfig,
    refetch,
  };
};
