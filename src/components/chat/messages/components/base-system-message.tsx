"use client";

import React from "react";
import { cn } from "@/lib/utils";
import MessageHeader from "./message-header";
import MessageActions, { MessageAction } from "./message-actions";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export interface BaseSystemMessageProps {
  target?: CustomResourceTarget | BuiltinResourceTarget;
  actions?: MessageAction[];
  showHeader?: boolean;
  children?: React.ReactNode;
}

export function BaseSystemMessage({
  target,
  actions = [],
  showHeader = true,
  children,
}: BaseSystemMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="rounded-lg py-2 text-md break-words text-foreground px-1 max-w-full">
        {/* Header Section */}
        {showHeader && target && (
          <div className="mb-3">
            <MessageHeader target={target} />
          </div>
        )}

        {/* Content Section */}
        <div className="space-y-3">{children}</div>

        {/* Actions Section */}
        {actions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <MessageActions actions={actions} />
          </div>
        )}
      </div>
    </div>
  );
}

export default BaseSystemMessage;
