"use client";

import { useState } from "react";
import { useDisclosure } from "@reactuses/core";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import DeployTemplate from "@/components/project/create-project/deploy-template";

export function useDeployTemplateDialog() {
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();

  const DeployTemplateDialog = () => (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <VisuallyHidden>
        <DialogTitle></DialogTitle>
      </VisuallyHidden>
      <DialogContent className="h-[90vh] max-h-none w-[90vw] max-w-none p-4 pt-0 rounded-xl!">
        <DeployTemplate closeDialog={onClose} />
      </DialogContent>
    </Dialog>
  );

  return {
    isOpen,
    openDialog: onOpen,
    closeDialog: onClose,
    DeployTemplateDialog,
  };
}
