"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Sheet = (props: React.ComponentProps<typeof SheetPrimitive.Root>) => (
  <SheetPrimitive.Root modal={false} {...props} />
);

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-200 data-[state=open]:duration-200",
  {
    variants: {
      side: {
        top: "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top left-4 right-4 top-4 border rounded-b-lg",
        bottom:
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom left-4 right-4 bottom-4 border rounded-t-lg",
        left: "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left top-4 bottom-4 left-4 w-3/4 border rounded-r-lg",
        right:
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right top-0 bottom-0 right-0 w-[40%] rounded-l-lg border-l",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

interface SheetRailProps extends React.ComponentProps<"button"> {
  onClose?: () => void;
}
const SheetRail = React.forwardRef<HTMLButtonElement, SheetRailProps>(
  ({ className, onClose, ...props }, ref) => (
    <button
      aria-label="Close Sheet"
      className={cn(
        "absolute -left-4 top-0 z-50 h-full w-4 bg-transparent transition-colors group/rail cursor-e-resize",
        className
      )}
      onClick={onClose}
      ref={ref}
      tabIndex={0}
      title="Close Sheet"
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 rounded bg-muted opacity-0 transition-opacity group-hover/rail:opacity-100"
        )}
      />
    </button>
  )
);
SheetRail.displayName = "SheetRail";

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  onClose?: () => void;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, onClose, ...props }, ref) => {
  return (
    <SheetPortal>
      {/* <SheetOverlay /> */}
      <SheetPrimitive.Content
        className={cn(sheetVariants({ side }), className)}
        ref={ref}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        {...props}
      >
        <SheetRail onClose={onClose} />
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    className={cn("font-semibold text-foreground text-lg", className)}
    ref={ref}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    className={cn("text-muted-foreground text-sm", className)}
    ref={ref}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetRail,
};
