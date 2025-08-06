"use client";

import { Database, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClusterNodeBackupTitleProps {
  backupsCount: number;
  clusterName: string;
  onToggleExpand: () => void;
  isExpanded: boolean;
}

export default function ClusterNodeBackupTitle({
  backupsCount,
  clusterName,
  onToggleExpand,
  isExpanded,
}: ClusterNodeBackupTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{clusterName}</span>
          <span className="text-xs text-muted-foreground">
            {backupsCount} backup{backupsCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
        >
          {isExpanded ? (
            <Minimize2 className="h-3 w-3" />
          ) : (
            <Maximize2 className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}