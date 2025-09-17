"use client";

import { useState } from "react";
import { useDisclosure } from "@reactuses/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LaunchpadCreateSimpleForm,
  LaunchpadSimpleFormData,
} from "@/components/forms/launchpad/launchpad-create-form-simple";
import { useLaunchpadCreate } from "@/hooks/sealos/launchpad/use-launchpad-create";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";

export function useLaunchpadCreateDialog() {
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const { createLaunchpad, isLoading } = useLaunchpadCreate();

  const handleSubmit = async (data: LaunchpadSimpleFormData) => {
    try {
      // Convert simple form data to full form data
      const fullFormData: LaunchpadCreateFormData = {
        ...data,
        // Resource configuration will use default values from schema
        resource: data.resource || {
          replicas: 1,
          cpu: 0.5,
          memory: 0.5,
        },
      };
      await createLaunchpad(fullFormData);
      onClose(); // Close dialog on successful creation
    } catch (error) {
      console.error("Error creating launchpad:", error);
    }
  };

  const LaunchpadCreateDialog = () => (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent className="max-h-sm max-w-lg p-4 rounded-xl!">
        <div className="flex-1 overflow-y-auto">
          <LaunchpadCreateSimpleForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  return {
    isOpen,
    openDialog: onOpen,
    closeDialog: onClose,
    LaunchpadCreateDialog,
  };
}
