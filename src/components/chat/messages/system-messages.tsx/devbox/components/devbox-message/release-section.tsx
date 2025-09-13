"use client";

import React from "react";
import { GitBranch } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useDevboxRelease } from "@/hooks/sealos/devbox/use-devbox-release";

interface ReleaseSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

export const ReleaseSection: React.FC<ReleaseSectionProps> = ({ target, onSectionClick }) => {
  const { releases } = useDevboxRelease(target.name);
  const releasesCount = releases?.length || 0;

  return (
    <div 
      className="p-2 bg-background-tertiary rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Release</span>
          <span className="text-xs text-muted-foreground">{releasesCount} releases</span>
        </div>
      </div>
    </div>
  );
};

export default ReleaseSection;