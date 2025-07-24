"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionWrapperProps {
  title: string;
  icon?: ReactNode;
  status?: "complete" | "executing" | "inProgress" | "idle";
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

function getStatusConfig(status: string) {
  switch (status) {
    case "complete":
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        color: "text-green-600",
        badge: { variant: "default" as const, text: "Complete" },
      };
    case "executing":
      return {
        icon: <Play className="w-4 h-4" />,
        color: "text-blue-600",
        badge: { variant: "default" as const, text: "Executing" },
      };
    case "inProgress":
      return {
        icon: <Clock className="w-4 h-4" />,
        color: "text-yellow-600",
        badge: { variant: "secondary" as const, text: "In Progress" },
      };
    case "idle":
    default:
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        color: "text-muted-foreground",
        badge: { variant: "outline" as const, text: "Idle" },
      };
  }
}

export function ActionWrapper({
  title,
  icon,
  status = "idle",
  children,
  className,
  defaultOpen = false,
}: ActionWrapperProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const statusConfig = getStatusConfig(status);

  // Auto-expand when status is complete
  useEffect(() => {
    if (status === "complete") {
      setIsOpen(true);
    }
  }, [status]);

  // Show content only when complete, otherwise show status indicator
  const showContent = status === "complete";
  const showStatusInContent = status === "inProgress" || status === "executing";

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("w-full", className)}
    >
      <Card>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {icon || (
                <div className={statusConfig.color}>{statusConfig.icon}</div>
              )}
              <span className="text-sm font-medium">{title}</span>
              <Badge variant={statusConfig.badge.variant}>
                {statusConfig.badge.text}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-0">
            {showContent ? (
              children
            ) : showStatusInContent ? (
              <div className="flex items-center gap-2 py-2">
                <div className={statusConfig.color}>{statusConfig.icon}</div>
                <span className="text-sm text-muted-foreground">
                  {status === "executing"
                    ? "Action in progress..."
                    : "Preparing action..."}
                </span>
              </div>
            ) : (
              children
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Specialized wrapper for render function props
interface RenderActionWrapperProps {
  title: string;
  icon?: ReactNode;
  status?: "complete" | "executing" | "inProgress" | "idle";
  args?: any;
  result?: any;
  children: ReactNode;
  className?: string;
}

export function RenderActionWrapper({
  title,
  icon,
  status = "idle",
  args,
  result,
  children,
  className,
}: RenderActionWrapperProps) {
  return (
    <ActionWrapper
      title={title}
      icon={icon}
      status={status}
      className={className}
      defaultOpen={false}
    >
      {children}
    </ActionWrapper>
  );
}

// Specialized wrapper for renderAndWaitForResponse function props
interface RenderAndWaitActionWrapperProps {
  title: string;
  icon?: ReactNode;
  status: "complete" | "executing" | "inProgress";
  args: any;
  respond?: (response: string) => void;
  result?: any;
  children: ReactNode;
  className?: string;
}

export function RenderAndWaitActionWrapper({
  title,
  icon,
  status,
  args,
  respond,
  result,
  children,
  className,
}: RenderAndWaitActionWrapperProps) {
  return (
    <ActionWrapper
      title={title}
      icon={icon}
      status={status}
      className={className}
      defaultOpen={false}
    >
      {children}
    </ActionWrapper>
  );
}
