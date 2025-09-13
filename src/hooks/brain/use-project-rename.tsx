"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { toast } from "sonner";

interface UseProjectRenameProps {
  projectName: string;
  currentDisplayName: string;
}

export function useProjectRename({ projectName, currentDisplayName }: UseProjectRenameProps) {
  const { project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const renameProjectMutation = useMutation(
    project.updateName.mutationOptions({
      onSuccess: () => {
        invalidateQueries([project.list.queryKey()]);
        toast.success("Project renamed successfully");
        setIsRenameDialogOpen(false);
      },
      onError: (error: any) => {
        toast.error("Failed to rename project");
        console.error("Failed to rename project:", error);
      },
    })
  );

  const handleRename = () => {
    setIsRenameDialogOpen(true);
  };

  const handleRenameConfirm = async (newDisplayName: string) => {
    if (newDisplayName.trim() && newDisplayName !== currentDisplayName) {
      try {
        await renameProjectMutation.mutateAsync({
          name: projectName,
          newDisplayName: newDisplayName.trim(),
        });
      } catch (error) {
        console.error("Failed to rename project:", error);
      }
    } else {
      setIsRenameDialogOpen(false);
    }
  };

  const handleRenameCancel = () => {
    setIsRenameDialogOpen(false);
  };

  return {
    isRenameDialogOpen,
    isRenaming: renameProjectMutation.isPending,
    handleRename,
    handleRenameConfirm,
    handleRenameCancel,
  };
}
