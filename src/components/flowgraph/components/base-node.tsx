import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const BaseNode = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "relative cursor-pointer rounded-xl border border-border-primary bg-node-background p-5 text-card-foreground h-50",
      // Only apply fixed width if not overridden by className
      !className?.includes("w-") && "w-70",
      className,
      "hover:brightness-120"
    )}
    ref={ref}
    tabIndex={0}
    {...props}
  />
));

BaseNode.displayName = "BaseNode";
