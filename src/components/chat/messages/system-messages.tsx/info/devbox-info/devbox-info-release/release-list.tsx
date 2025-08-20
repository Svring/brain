import React from "react";
import { ArrowBigUpDash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReleaseItem } from "./release-item";

interface Release {
  id: string;
  tag: string;
  createTime: string;
  status?: {
    value: string;
    label: string;
  };
}

interface DeployConfig {
  cpu: number;
  memory: number;
}

interface ReleaseListProps {
  releases: Release[];
  isLoading: boolean;
  deployConfig: DeployConfig;
  setDeployConfig: (config: DeployConfig) => void;
  openPopovers: Record<string, boolean>;
  openDeletePopovers: Record<string, boolean>;
  setPopoverOpen: (releaseTag: string, open: boolean) => void;
  setDeletePopoverOpen: (releaseTag: string, open: boolean) => void;
  onDeploy: (releaseTag: string, config: DeployConfig) => void;
  onDelete: (releaseTag: string) => void;
  deployMutationPending: boolean;
  deleteMutationPending: boolean;
}

export const ReleaseList: React.FC<ReleaseListProps> = ({
  releases,
  isLoading,
  deployConfig,
  setDeployConfig,
  openPopovers,
  openDeletePopovers,
  setPopoverOpen,
  setDeletePopoverOpen,
  onDeploy,
  onDelete,
  deployMutationPending,
  deleteMutationPending,
}) => {
  if (isLoading) {
    return (
      <ScrollArea className="flex-1 max-h-80">
        <div className="flex items-center justify-center h-20">
          <div className="text-xs text-muted-foreground">Loading...</div>
        </div>
      </ScrollArea>
    );
  }

  if (!releases || releases.length === 0) {
    return (
      <ScrollArea className="flex-1 max-h-80">
        <div className="flex flex-col items-center justify-center h-20 text-center">
          <ArrowBigUpDash className="h-6 w-6 text-muted-foreground mb-2" />
          <div className="text-xs text-muted-foreground">No releases yet</div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 max-h-80">
      <div className="space-y-2">
        {releases.map((release) => (
          <ReleaseItem
            key={release.id}
            release={release}
            deployConfig={deployConfig}
            setDeployConfig={setDeployConfig}
            openPopovers={openPopovers}
            openDeletePopovers={openDeletePopovers}
            setPopoverOpen={setPopoverOpen}
            setDeletePopoverOpen={setDeletePopoverOpen}
            onDeploy={onDeploy}
            onDelete={onDelete}
            deployMutationPending={deployMutationPending}
            deleteMutationPending={deleteMutationPending}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
