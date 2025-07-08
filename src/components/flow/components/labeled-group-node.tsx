import { type NodeProps, Panel, type PanelPosition } from "@xyflow/react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { BaseNode } from "@/components/flow/components/base-node";
import { cn } from "@/lib/utils";

/* GROUP NODE Label ------------------------------------------------------- */

export type GroupNodeLabelProps = HTMLAttributes<HTMLDivElement>;

export const GroupNodeLabel = forwardRef<HTMLDivElement, GroupNodeLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div className="h-full w-full" ref={ref} {...props}>
        <div
          className={cn(
            "w-fit bg-background p-2 text-card-foreground text-xs",
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

GroupNodeLabel.displayName = "GroupNodeLabel";

export type GroupNodeProps = Partial<NodeProps> & {
  label?: ReactNode;
  position?: PanelPosition;
};

/* GROUP NODE -------------------------------------------------------------- */

export const GroupNode = forwardRef<HTMLDivElement, GroupNodeProps>(
  ({ selected, label, position, ...props }, ref) => {
    const getLabelClassName = (position?: PanelPosition) => {
      switch (position) {
        case "top-left":
          return "rounded-br-sm";
        case "top-center":
          return "rounded-b-sm";
        case "top-right":
          return "rounded-bl-sm";
        case "bottom-left":
          return "rounded-tr-sm";
        case "bottom-right":
          return "rounded-tl-sm";
        case "bottom-center":
          return "rounded-t-sm";
        default:
          return "rounded-br-sm";
      }
    };

    return (
      <BaseNode
        className="h-full overflow-hidden rounded-sm bg-white bg-opacity-50 p-0"
        ref={ref}
        selected={selected}
        {...props}
      >
        <Panel className={cn("m-0 p-0")} position={position}>
          {label && (
            <GroupNodeLabel className={getLabelClassName(position)}>
              {label}
            </GroupNodeLabel>
          )}
        </Panel>
      </BaseNode>
    );
  }
);

GroupNode.displayName = "GroupNode";
