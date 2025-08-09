"use client";

import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export type AIToolStatus = "complete" | "executing" | "inProgress";

export type AIToolProps = ComponentProps<typeof Collapsible> & {
  status?: AIToolStatus;
};

export const AITool = ({
  className,
  status = "inProgress",
  ...props
}: AIToolProps) => (
  <Collapsible
    className={cn("not-prose mb-4 w-full rounded-md border", className)}
    {...props}
  />
);

export type AIToolHeaderProps = ComponentProps<typeof CollapsibleTrigger> & {
  status?: AIToolStatus;
  name: string;
  description?: string;
};

const getStatusBadge = (status: AIToolStatus) => {
  const labels = {
    complete: "Complete",
    executing: "Executing",
    inProgress: "In Progress",
  } as const;

  const icons = {
    complete: <CheckCircleIcon className="size-4 text-green-600" />,
    executing: <ClockIcon className="size-4 animate-pulse" />,
    inProgress: <CircleIcon className="size-4" />,
  } as const;

  return (
    <Badge className="rounded-full text-xs" variant="secondary">
      {icons[status]}
      {labels[status]}
    </Badge>
  );
};

export const AIToolHeader = ({
  className,
  status = "inProgress",
  name,
  description,
  ...props
}: AIToolHeaderProps) => (
  <CollapsibleTrigger
    className={cn(
      "flex w-full items-center justify-between gap-4 p-2",
      className
    )}
    {...props}
  >
    <div className="flex items-center gap-2">
      <WrenchIcon className="size-4 text-muted-foreground" />
      <span className="font-medium text-sm">{name}</span>
      {getStatusBadge(status)}
    </div>
    <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
  </CollapsibleTrigger>
);

export type AIToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const AIToolContent = ({ className, ...props }: AIToolContentProps) => (
  <CollapsibleContent
    className={cn("grid gap-4 overflow-hidden border-t p-4 text-sm", className)}
    {...props}
  />
);

export type AIToolParametersProps = ComponentProps<"div"> & {
  parameters: Record<string, unknown>;
};

export const AIToolParameters = ({
  className,
  parameters,
  ...props
}: AIToolParametersProps) => (
  <div className={cn("space-y-1", className)} {...props}>
    <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
      Parameters
    </h4>
    <div className="rounded-md bg-muted/50 p-2">
      <pre className="overflow-x-auto text-muted-foreground text-xs">
        {JSON.stringify(parameters, null, 2)}
      </pre>
    </div>
  </div>
);

export type AIToolResultProps = ComponentProps<"div"> & {
  result?: ReactNode;
  error?: string;
};

export const AIToolResult = ({
  className,
  result,
  error,
  ...props
}: AIToolResultProps) => {
  if (!(result || error)) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {error ? "Error" : "Result"}
      </h4>
      <div
        className={cn(
          "overflow-x-auto rounded-md p-2 text-xs",
          error
            ? "bg-destructive/10 text-destructive"
            : "bg-muted/50 text-foreground"
        )}
      >
        {error ? <div>{error}</div> : <div>{result}</div>}
      </div>
    </div>
  );
};
