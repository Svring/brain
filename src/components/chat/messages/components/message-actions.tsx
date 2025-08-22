"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MessageAction {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
}

interface MessageActionsProps {
  actions: MessageAction[];
  className?: string;
}

export default function MessageActions({ actions, className }: MessageActionsProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      {actions.map((action, index) => (
        <Button
          key={`${action.label}-${index}`}
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="flex-1 flex items-center gap-2"
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}