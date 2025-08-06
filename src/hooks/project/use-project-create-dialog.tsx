"use client";

import { useState } from "react";
import { useDisclosure } from "@reactuses/core";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import CreateProject from "@/components/project/create-project/create-project";

export function useCreateProjectDialog() {
  const { isOpen, onClose, onOpenChange } = useDisclosure();

  const CreateProjectDialog = () => (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <VisuallyHidden>
        <DialogTitle>Create Project</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="h-[90vh] max-h-none w-[90vw] max-w-none">
        <CreateProject />
      </DialogContent>
    </Dialog>
  );

  return {
    isOpen,
    openDialog: onOpenChange,
    closeDialog: onClose,
    CreateProjectDialog,
  };
}
