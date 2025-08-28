"use client";

import React from "react";
import { cn } from "@/lib/utils";
import MessageHeader from "./base-message-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export interface MessageAction {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface BaseSystemMessageProps {
  target?: CustomResourceTarget | BuiltinResourceTarget;
  actions?: MessageAction[];
  showHeader?: boolean;
  headerSlot?: React.ReactNode;
  children?: React.ReactNode;
  prompt?: string;
}

export function BaseSystemMessage({
  target,
  actions = [],
  showHeader = true,
  headerSlot,
  children,
  prompt,
}: BaseSystemMessageProps) {
  return (
    <div className="flex justify-start w-full">
      <Card className="w-full bg-background-secondary border border-border-primary pt-0">
        {/* Header Section */}
        {showHeader && target && (
          <MessageHeader target={target} headerSlot={headerSlot} />
        )}

        {/* Content Section */}
        <CardContent className="px-4 space-y-4">{children}</CardContent>

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

export default BaseSystemMessage;
