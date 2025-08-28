"use client";

import { useState } from "react";
import { useDisclosure } from "@reactuses/core";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import CreateProject from "@/components/project/create-project/create-project";

export function useProjectCreateDialog() {
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();

  const CreateProjectDialog = () => (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <VisuallyHidden>
        <DialogTitle></DialogTitle>
      </VisuallyHidden>
      <DialogContent className="h-[90vh] max-h-none w-[90vw] max-w-none p-4 pt-0 rounded-xl!">
        <CreateProject closeDialog={onClose} />
      </DialogContent>
    </Dialog>
  );

  return {
    isOpen,
    openDialog: onOpen,
    closeDialog: onClose,
    CreateProjectDialog,
  };
}
