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
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface RenameProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  currentDisplayName: string;
  onConfirm?: (newDisplayName: string) => void;
  onCancel?: () => void;
  isPending?: boolean;
}

export function RenameProjectDialog({
  isOpen,
  onClose,
  projectName,
  currentDisplayName,
  onConfirm,
  onCancel,
  isPending: externalIsPending,
}: RenameProjectDialogProps) {
  const { project } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const [editValue, setEditValue] = React.useState(currentDisplayName);

  const renameProjectMutation = useMutation(
    project.updateName.mutationOptions({
      onSuccess: () => {
        invalidateQueries([project.list.queryKey()]);
        toast.success("Project renamed successfully");
        onClose();
        setEditValue(currentDisplayName);
      },
      onError: (error: any) => {
        toast.error("Failed to rename project");
        console.error("Failed to rename project:", error);
      },
    })
  );

  const isPending = externalIsPending ?? renameProjectMutation.isPending;

  React.useEffect(() => {
    if (isOpen) {
      setEditValue(currentDisplayName);
    }
  }, [isOpen, currentDisplayName]);

  const handleSave = async () => {
    if (onConfirm) {
      onConfirm(editValue);
    } else {
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
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setEditValue(currentDisplayName);
      onClose();
    }
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
          <DialogTitle>Rename Project</DialogTitle>
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? (
              <Spinner variant="bars" className="h-4 w-4" />
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
