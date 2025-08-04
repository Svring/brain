import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const BaseNode = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { selected?: boolean; expand?: boolean }
>(({ className, selected, expand, ...props }, ref) => (
  <div
    className={cn(
      "relative cursor-pointer rounded-xl border bg-node-background p-5 text-card-foreground w-70 h-50",
      className,
      selected ? "border-theme-darkblue shadow-lg" : "",
      expand ? "h-150 w-100" : "",
      "hover:brightness-120"
    )}
    ref={ref}
    tabIndex={0}
    {...props}
  />
));

BaseNode.displayName = "BaseNode";
