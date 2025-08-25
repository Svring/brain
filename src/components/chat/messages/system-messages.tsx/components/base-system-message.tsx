"use client";

import React from "react";
import { cn } from "@/lib/utils";
import MessageHeader from "./message-header";
import MessageActions, { MessageAction } from "./message-actions";
import { Card, CardContent } from "@/components/ui/card";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export interface BaseSystemMessageProps {
  target?: CustomResourceTarget | BuiltinResourceTarget;
  actions?: MessageAction[];
  showHeader?: boolean;
  headerSlot?: React.ReactNode;
  children?: React.ReactNode;
}

export function BaseSystemMessage({
  target,
  actions = [],
  showHeader = true,
  headerSlot,
  children,
}: BaseSystemMessageProps) {
  return (
    <div className="flex justify-start w-full">
      <Card className="w-full bg-background-secondary border border-border-primary">
        {/* Header Section */}
        {showHeader && target && (
          <div className="px-6">
            <div className="flex items-center justify-between">
              <MessageHeader target={target} />
              {headerSlot && (
                <div className="flex-shrink-0">
                  {headerSlot}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Section */}
        <CardContent className="px-6 space-y-4">{children}</CardContent>

        {/* Actions Section */}
        {actions.length > 0 && (
          <div className="flex gap-3 px-6">
            <MessageActions actions={actions} />
          </div>
        )}
      </Card>
    </div>
  );
}

export default BaseSystemMessage;
