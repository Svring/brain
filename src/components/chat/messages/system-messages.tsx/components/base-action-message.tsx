"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import BaseSystemMessage, { BaseSystemMessageProps } from "./base-system-message";

export interface BaseActionMessageProps {
  headerTitle: {
    icon: React.ElementType;
    name: string;
  };
  children?: React.ReactNode;
  className?: string;
  formId?: string;
  onApply?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  headerSlot?: React.ReactNode;
  applyButtonText?: string;
}

export default function BaseActionMessage({
  headerTitle,
  children,
  className,
  formId,
  onApply,
  isSubmitting = false,
  disabled = false,
  headerSlot,
  applyButtonText = "Apply",
}: BaseActionMessageProps) {
  const applyButton = (
    <Button
      type="submit"
      form={formId}
      size="sm"
      variant="outline"
      disabled={disabled || isSubmitting}
      className="flex items-center gap-2 border border-border-primary brightness-150"
      onClick={onApply}
    >
      <Sparkles className="w-3 h-3 text-theme-blue" />
      {applyButtonText}
    </Button>
  );

  const combinedHeaderSlot = (
    <div className="flex items-center gap-2">
      {headerSlot}
      {applyButton}
    </div>
  );

  return (
    <BaseSystemMessage
      headerTitle={headerTitle}
      headerSlot={combinedHeaderSlot}
      className={className}
    >
      {children}
    </BaseSystemMessage>
  );
}
