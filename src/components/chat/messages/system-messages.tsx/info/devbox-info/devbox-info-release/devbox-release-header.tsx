import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DevboxReleaseHeaderProps {
  devboxName: string;
  releaseCount: number;
  isReleasePopoverOpen: boolean;
  setIsReleasePopoverOpen: (open: boolean) => void;
  children: React.ReactNode; // For the create release form
}

export const DevboxReleaseHeader: React.FC<DevboxReleaseHeaderProps> = ({
  devboxName,
  releaseCount,
  isReleasePopoverOpen,
  setIsReleasePopoverOpen,
  children,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-foreground text-lg">
          Releases of {devboxName}
        </h3>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
          {releaseCount} release{releaseCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Popover
          open={isReleasePopoverOpen}
          onOpenChange={setIsReleasePopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 z-[9999]" side="top">
            {children}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
