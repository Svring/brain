"use client";

import React from "react";
import { cn } from "@/lib/utils";
import BaseActionHeader from "./base-action-header";
import { Card, CardContent } from "@/components/ui/card";

export interface BaseActionMessageProps {
  headerTitle: {
    icon: React.ElementType;
    name: string;
  };
  headerSlot?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export default function BaseActionMessage({
  headerTitle,
  headerSlot,
  children,
  className,
}: BaseActionMessageProps) {
  return (
    <div className="flex justify-start w-full">
      <Card
        className={cn(
          "w-full bg-background-secondary border border-border-primary p-0 gap-0",
          className
        )}
      >
        {/* Header Section */}
        <BaseActionHeader headerTitle={headerTitle} headerSlot={headerSlot} />

        {/* Content Section */}
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </div>
  );
}
