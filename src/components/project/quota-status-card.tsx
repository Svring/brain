"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { openCostCenterApp } from "@/lib/auth/auth-utils";

interface QuotaStatus {
  resource: "cpu" | "memory" | "storage" | "ports";
  required: number;
  available: number;
  message: string;
}

interface QuotaStatusCardProps {
  exceededResources: QuotaStatus[];
  className?: string;
}

export function QuotaStatusCard({
  exceededResources,
  className = "",
}: QuotaStatusCardProps) {
  if (exceededResources.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-col space-y-3 w-full p-4 border rounded-lg bg-background ${className}`}
    >
      <h3 className="text-lg font-semibold">Insufficient Quotas</h3>
      <div className="text-sm space-y-1">
        {exceededResources.map((resource, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              dangerouslySetInnerHTML={{
                __html: resource.message.replace(
                  /(\d+(?:\.\d+)?)/g,
                  '<span class="text-foreground font-semibold">$1</span>'
                ),
              }}
            />
          </div>
        ))}
      </div>
      <Button
        onClick={openCostCenterApp}
        className="w-full py-1.5 bg-foreground text-sm text-background rounded-md hover:opacity-90 transition-opacity"
      >
        Open Cost Center
      </Button>
    </div>
  );
}

// Dummy data for testing
export const dummyQuotaData: QuotaStatus[] = [
  {
    resource: "cpu",
    required: 2.5,
    available: 1.2,
    message: "CPU: requires 2.5 cores, 1.2 cores available",
  },
  {
    resource: "memory",
    required: 4.0,
    available: 2.1,
    message: "Memory: requires 4.0GB, 2.1GB available",
  },
  {
    resource: "storage",
    required: 10.0,
    available: 5.5,
    message: "Storage: requires 10.0GB, 5.5GB available",
  },
];
