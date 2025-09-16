"use client";

import { ReactNode } from "react";

interface NodeHemProps {
  mainCard: ReactNode;
  hemComponent?: ReactNode;
  className?: string;
}

export default function NodeHem({
  mainCard,
  hemComponent,
  className = "",
}: NodeHemProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Hem component - positioned behind main card */}
      {hemComponent && (
        <div className="absolute inset-x-0 top-0 z-10">
          <div className="bg-muted border rounded-xl pt-8 text-xs flex flex-col h-60">
            <div className="flex-1 bg-background-secondary"></div>
            <div className="h-10">{hemComponent}</div>
          </div>
        </div>
      )}

      {/* Main card - positioned above hem */}
      <div className="relative z-20">{mainCard}</div>
    </div>
  );
}
