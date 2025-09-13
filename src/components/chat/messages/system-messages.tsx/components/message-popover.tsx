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
  triggerIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  triggerLabel?: string;
  triggerClassName?: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function MessagePopover({
  children,
  popoverContent,
  triggerIcon: TriggerIcon = MoreHorizontal,
  triggerLabel = "More options",
  triggerClassName,
  className,
  open,
  onOpenChange,
  showTrigger = true,
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
        <Popover open={isOpen} onOpenChange={setIsOpen}>
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
              <div ref={triggerRef} className="absolute inset-0 z-10" />
            </PopoverTrigger>
          )}

          <PopoverContent
            className={cn(
              "p-0 border border-border-primary shadow-lg bg-background-secondary rounded-xl"
            )}
            style={{
              width: "var(--radix-popover-trigger-width)",
            }}
            align="center"
            side="top"
            sideOffset={12}
            avoidCollisions={true}
          >
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-20 h-8 w-8 p-0 hover:bg-background-tertiary"
                onClick={() => setIsOpen(false)}
                aria-label="Close popover"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Popover content */}
              <div className="p-4 pt-12">{popoverContent}</div>
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
  popoverContent={
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Advanced Options</h3>
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
