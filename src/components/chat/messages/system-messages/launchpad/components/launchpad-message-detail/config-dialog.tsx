import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { Spinner } from "@/components/ui/spinner";

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fieldType: string;
  fieldTitle: string;
  defaultValues: any;
  onSubmit: (data: LaunchpadUpdateFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ConfigDialog: React.FC<ConfigDialogProps> = ({
  isOpen,
  onClose,
  fieldType,
  fieldTitle,
  defaultValues,
  onSubmit,
  isLoading = false,
}) => {
  const handleSubmit = async (data: LaunchpadUpdateFormData) => {
    await onSubmit(data);
    onClose();
  };

  console.log("defaultValues", defaultValues);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit {fieldTitle}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8"
                onClick={onClose}
                disabled={isLoading}
              >
                <X />
              </Button>
              <Button
                type="submit"
                form="launchpad-update-form"
                variant="outline"
                size="sm"
                className="h-8 w-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner variant="bars" className="h-4 w-4" />
                ) : (
                  <Check />
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <LaunchpadUpdateForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            hideDefaultButton={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
