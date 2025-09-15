"use client";

import React from "react";

interface BaseActionHeaderProps {
  headerTitle: {
    icon: React.ElementType;
    name: string;
  };
  headerSlot?: React.ReactNode;
}

export default function BaseActionHeader({
  headerTitle,
  headerSlot,
}: BaseActionHeaderProps) {
  return (
    <div className="p-3 py-1 bg-message-header rounded-t-xl border-b-border-primary border-b">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <div className="p-2 bg-muted rounded-lg">
            <headerTitle.icon className="w-4 h-4" />
          </div>
          <span className="flex flex-col min-w-0">
            <span className="text-foreground leading-none">
              {headerTitle.name}
            </span>
          </span>
        </span>
        {headerSlot && <div className="flex-shrink-0">{headerSlot}</div>}
      </div>
    </div>
  );
}
