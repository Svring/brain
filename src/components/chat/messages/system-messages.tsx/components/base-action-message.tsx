"use client";

import React from "react";
import { cn } from "@/lib/utils";
import BaseActionHeader from "./base-action-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface MessageAction {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface BaseActionMessageProps {
  headerTitle: {
    icon: React.ElementType;
    name: string;
  };
  headerSlot?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  actions?: MessageAction[];
  prompt?: string;
}

export default function BaseActionMessage({
  headerTitle,
  headerSlot,
  children,
  className,
  actions = [],
  prompt,
}: BaseActionMessageProps) {
  return (
    <div className="flex justify-start w-full">
      <Card
        className={cn(
          "w-full bg-background-secondary border border-border-primary py-0 gap-0",
          className
        )}
      >
        {/* Header Section */}
        <BaseActionHeader headerTitle={headerTitle} headerSlot={headerSlot} />

        {/* Content Section */}
        <CardContent className="p-4">{children}</CardContent>

        {/* Actions Section */}
        {actions.length > 0 && (
          <div className="px-4 space-y-3">
            {/* Actions Title */}
            <div className="relative flex items-center">
              <Separator className="flex-1" />
              <h3 className="text-sm font-medium text-foreground px-4">
                Actions
              </h3>
              <Separator className="flex-1" />
            </div>

            {/* Prompt */}
            {prompt && <div className="font-medium">{prompt}</div>}

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
        )}
      </Card>
    </div>
  );
}
