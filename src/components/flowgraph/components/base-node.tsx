import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const BaseNode = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "relative cursor-pointer rounded-xl border border-border-primary bg-node-background p-5 text-card-foreground w-70 h-50",
      className,
      "hover:brightness-120"
    )}
    ref={ref}
    tabIndex={0}
    {...props}
  />
));

BaseNode.displayName = "BaseNode";
