"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessagePopoverProps {
  children: React.ReactNode;
  popoverContent: React.ReactNode;
  popoverTitle?: string;
  triggerIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  triggerLabel?: string;
  triggerClassName?: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  disableOutsideClick?: boolean;
}

export function MessagePopover({
  children,
  popoverContent,
  popoverTitle,
  triggerIcon: TriggerIcon = MoreHorizontal,
  triggerLabel = "More options",
  triggerClassName,
  className,
  open,
  onOpenChange,
  showTrigger = true,
  disableOutsideClick = false,
}: MessagePopoverProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  // Ref for the popover trigger element
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      {/* Main content wrapper */}
      <div className={cn("relative", className)}>
        {children}

        {/* Popover trigger positioned absolutely */}
        <Popover
          open={isOpen}
          onOpenChange={(open) => {
            // Only allow closing if outside click is not disabled
            if (!disableOutsideClick || !open) {
              setIsOpen(open);
            }
          }}
        >
          {showTrigger ? (
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute top-2 right-2 z-10 h-8 w-8 p-0 opacity-0 hover:opacity-100 transition-opacity duration-200",
                  "hover:bg-background-tertiary",
                  isOpen && "opacity-100",
                  triggerClassName
                )}
                aria-label={triggerLabel}
              >
                <TriggerIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          ) : (
            <PopoverTrigger asChild>
              <div
                ref={triggerRef}
                className="absolute inset-0 pointer-events-none opacity-0"
                style={{ zIndex: -1 }}
              />
            </PopoverTrigger>
          )}

          <PopoverContent
            className={cn(
              "p-2 border border-border-primary shadow-lg bg-background-secondary rounded-xl"
            )}
            style={{
              width: "var(--radix-popover-trigger-width)",
            }}
            align="center"
            side="top"
            sideOffset={8}
            avoidCollisions={true}
          >
            <div className="relative space-y-2">
              {/* Header row with title and close button */}
              <div className="flex items-center justify-between border-border-primary px-1">
                {popoverTitle && (
                  <h3 className="font-semibold text-sm text-foreground">
                    {popoverTitle}
                  </h3>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-background-tertiary"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close popover"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Popover content */}
              <div className="">{popoverContent}</div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default MessagePopover;

/* 
Example Usage:

// Basic usage with custom content
<MessagePopover 
  popoverTitle="Custom Title"
  popoverContent={
    <div>
      <h3>Custom Content</h3>
      <p>Any React component can go here!</p>
    </div>
  }
>
  <YourMessageComponent />
</MessagePopover>

// With custom trigger icon and styling
<MessagePopover 
  popoverTitle="Settings"
  popoverContent={<CustomSettingsPanel />}
  triggerIcon={Settings}
  triggerLabel="Open settings"
  triggerClassName="opacity-100" // Always show trigger
  className="custom-wrapper-class"
>
  <YourMessageComponent />
</MessagePopover>

// Complex popover content example
<MessagePopover 
  popoverTitle="Advanced Options"
  popoverContent={
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Configure your resource</p>
      </div>
      <div className="space-y-2">
        <Button onClick={() => console.log('Action 1')}>Action 1</Button>
        <Button onClick={() => console.log('Action 2')}>Action 2</Button>
      </div>
      <div className="border-t pt-2">
        <p className="text-xs">Additional information here</p>
      </div>
    </div>
  }
>
  <YourMessageComponent />
</MessagePopover>
*/
