import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Trash2 } from "lucide-react";

interface DeleteReleasePopoverProps {
  releaseTag: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (releaseTag: string) => void;
  isPending: boolean;
  isDisabled?: boolean;
}

export const DeleteReleasePopover: React.FC<DeleteReleasePopoverProps> = ({
  releaseTag,
  isOpen,
  onOpenChange,
  onDelete,
  isPending,
  isDisabled = false,
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          disabled={isDisabled}
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 z-[9999] bg-node-background"
        side="top"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-destructive">
              Delete Release
            </h4>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete release {releaseTag}? This action
              cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onDelete(releaseTag)}
              variant="destructive"
              size="sm"
              disabled={isPending || isDisabled}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
