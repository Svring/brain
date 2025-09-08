"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface RenameProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  currentDisplayName: string;
}

export function RenameProjectDialog({
  isOpen,
  onClose,
  projectName,
  currentDisplayName,
}: RenameProjectDialogProps) {
  const { project: projectClient } = useTRPCClients();
  const queryClient = useQueryClient();
  const [editValue, setEditValue] = React.useState(currentDisplayName);

  const renameProjectMutation = useMutation(
    projectClient.updateProjectName.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: projectClient.listProjects.queryKey(),
        });
        toast.success("Project renamed successfully");
        onClose();
        setEditValue(currentDisplayName);
      },
      onError: (error) => {
        toast.error("Failed to rename project");
        console.error("Failed to rename project:", error);
      },
    })
  );

  React.useEffect(() => {
    if (isOpen) {
      setEditValue(currentDisplayName);
    }
  }, [isOpen, currentDisplayName]);

  const handleSave = async () => {
    if (editValue.trim() && editValue !== currentDisplayName) {
      try {
        await renameProjectMutation.mutateAsync({
          name: projectName,
          newDisplayName: editValue.trim(),
        });
      } catch (error) {
        console.error("Failed to rename project:", error);
      }
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    setEditValue(currentDisplayName);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Rename Project</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8"
                onClick={handleCancel}
                disabled={renameProjectMutation.isPending}
              >
                <X />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8"
                onClick={handleSave}
                disabled={renameProjectMutation.isPending}
              >
                {renameProjectMutation.isPending ? (
                  <Spinner variant="bars" className="h-4 w-4" />
                ) : (
                  <Check />
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <div className="flex items-center gap-4">
            <Input
              id="name"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              autoFocus
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
