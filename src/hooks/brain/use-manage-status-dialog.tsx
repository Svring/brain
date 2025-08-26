"use client";

import { useDisclosure } from "@reactuses/core";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import ManageStatusDialog from "@/components/project/manage-status/manage-status-dialog";

export function useManageStatusDialog() {
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();

  const ManageStatusDialogComponent = () => (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <VisuallyHidden>
        <DialogTitle>Manage Resources Status</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="h-[70vh] max-h-none w-[70vw] max-w-none">
        <ManageStatusDialog closeDialog={onClose} />
      </DialogContent>
    </Dialog>
  );

  return {
    isOpen,
    openDialog: onOpen,
    closeDialog: onClose,
    ManageStatusDialogComponent,
  };
}
