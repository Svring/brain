"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex w-full flex-col rounded-xl transition-all duration-300 ease-out",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        hideCloseButton
        className={cn("overflow-auto p-0 w-[40vw] min-w-xl max-w-none max-h-[80vh] transition-all duration-300 ease-out rounded-xl!", className)}
      >
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "scroll-py-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-out",
        className
      )}
      {...props}
    />
  )
}

function CommandListAnimated({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  const [selectedElement, setSelectedElement] = React.useState<HTMLElement | null>(null);
  const [backgroundBounds, setBackgroundBounds] = React.useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleSelectionChange = () => {
      const selected = document.querySelector('[data-slot="command-item"][data-selected="true"]') as HTMLElement;
      if (selected && listRef.current) {
        setSelectedElement(selected);
        const listRect = listRef.current.getBoundingClientRect();
        const selectedRect = selected.getBoundingClientRect();
        
        setBackgroundBounds({
          top: selectedRect.top - listRect.top + listRef.current.scrollTop,
          left: selectedRect.left - listRect.left,
          width: selectedRect.width,
          height: selectedRect.height,
        });
      } else {
        // If no selected item found, hide the background
        setSelectedElement(null);
      }
    };

    // Use MutationObserver to watch for selection changes and DOM structure changes
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        // Check for attribute changes (selection changes)
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-selected') {
          shouldUpdate = true;
        }
        // Check for childList changes (new items added/removed)
        if (mutation.type === 'childList') {
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        // Small delay to ensure DOM is fully updated
        setTimeout(handleSelectionChange, 10);
      }
    });

    if (listRef.current) {
      observer.observe(listRef.current, {
        attributes: true,
        attributeFilter: ['data-selected'],
        subtree: true,
        childList: true, // Watch for children being added/removed
      });
    }

    // Initial check with a small delay to ensure content is rendered
    const timeoutId = setTimeout(handleSelectionChange, 50);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  // Also run the selection check when the component content changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      const selected = document.querySelector('[data-slot="command-item"][data-selected="true"]') as HTMLElement;
      if (selected && listRef.current) {
        setSelectedElement(selected);
        const listRect = listRef.current.getBoundingClientRect();
        const selectedRect = selected.getBoundingClientRect();
        
        setBackgroundBounds({
          top: selectedRect.top - listRect.top + listRef.current.scrollTop,
          left: selectedRect.left - listRect.left,
          width: selectedRect.width,
          height: selectedRect.height,
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [props.children]);

  return (
    <div ref={listRef} className="relative">
      {selectedElement && (
        <motion.div
          className="absolute bg-accent rounded-lg pointer-events-none"
          style={{ zIndex: 0 }}
          initial={{
            top: backgroundBounds.top,
            left: backgroundBounds.left,
            width: backgroundBounds.width,
            height: backgroundBounds.height,
          }}
          animate={{
            top: backgroundBounds.top,
            left: backgroundBounds.left,
            width: backgroundBounds.width,
            height: backgroundBounds.height,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.8,
          }}
          layout
        />
      )}
      <CommandPrimitive.List
        data-slot="command-list"
        className={cn(
          "scroll-py-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-out relative",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 z-10",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandListAnimated,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
