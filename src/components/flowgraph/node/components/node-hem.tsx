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
      {/* Main card with hem */}
      <div className="flex flex-col">
        {/* Main card */}
        <div className="flex-1">
          {mainCard}
        </div>
        
        {/* Hem component - additional row beneath main card */}
        {hemComponent && (
          <div className="mt-2 px-4 pb-2">
            <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs">
              {hemComponent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
