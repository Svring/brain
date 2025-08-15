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
          <div className="absolute inset-x-0 top-0 z-0">
            <div className="bg-node-background border rounded-lg px-3 pt-8 pb-1 text-xs flex flex-col h-58">
              <div className="flex-1"></div>
              <div className="flex-shrink-0">
                {hemComponent}
              </div>
            </div>
          </div>
        )}
      
      {/* Main card - positioned above hem */}
      <div className="relative z-10">
        {mainCard}
      </div>
    </div>
  );
}
