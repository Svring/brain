"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export interface MessageAction {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface MessageActionsProps {
  actions: MessageAction[];
}

export default function MessageActions({ actions }: MessageActionsProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Actions Title */}
      <div className="relative flex items-center">
        <Separator className="flex-1" />
        <h3 className="text-sm font-medium text-foreground px-4">Actions</h3>
        <Separator className="flex-1" />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Button
            key={`${action.label}-${index}`}
            variant="outline"
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="w-full flex items-center gap-2"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
