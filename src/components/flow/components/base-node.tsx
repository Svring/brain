import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const BaseNode = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <div
    className={cn(
      "relative rounded-xl border bg-background-secondary p-5 text-card-foreground w-70 h-50",
      className,
      selected ? "border-muted-foreground shadow-lg" : "",
      "hover:ring-1"
    )}
    ref={ref}
    tabIndex={0}
    {...props}
  />
));

BaseNode.displayName = "BaseNode";
