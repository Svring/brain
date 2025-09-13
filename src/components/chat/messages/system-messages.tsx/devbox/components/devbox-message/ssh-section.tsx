"use client";

import React from "react";
import { Terminal } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface SshSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

export const SshSection: React.FC<SshSectionProps> = ({ target, onSectionClick }) => {
  return (
    <div 
      className="p-2 bg-background-tertiary rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <Terminal className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">SSH Connection</span>
          <span className="text-xs text-muted-foreground">Details</span>
        </div>
      </div>
    </div>
  );
};

export default SshSection;