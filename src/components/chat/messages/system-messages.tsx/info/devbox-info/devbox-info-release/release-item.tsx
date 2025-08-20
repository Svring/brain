import React from "react";
import { Tag, Clock } from "lucide-react";
import { DeployConfigPopover } from "./deploy-config-popover";
import { DeleteReleasePopover } from "./delete-release-popover";

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

interface ReleaseItemProps {
  release: Release;
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

export const ReleaseItem: React.FC<ReleaseItemProps> = ({
  release,
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPending = release.status?.value === "Pending";

  return (
    <div className="border rounded-lg p-2 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Tag className="h-3 w-3 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs font-medium truncate">{release.tag}</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{formatDate(release.createTime)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Status indicator */}
          {isPending && (
            <span className="text-xs text-amber-500 font-medium">Pending</span>
          )}
          
          <DeployConfigPopover
            releaseTag={release.tag}
            isOpen={openPopovers[release.tag] || false}
            onOpenChange={(open) => setPopoverOpen(release.tag, open)}
            deployConfig={deployConfig}
            setDeployConfig={setDeployConfig}
            onDeploy={onDeploy}
            isPending={deployMutationPending}
            isDisabled={isPending}
          />
          
          <DeleteReleasePopover
            releaseTag={release.tag}
            isOpen={openDeletePopovers[release.tag] || false}
            onOpenChange={(open) => setDeletePopoverOpen(release.tag, open)}
            onDelete={onDelete}
            isPending={deleteMutationPending}
            isDisabled={!release.status || isPending}
          />
        </div>
      </div>
    </div>
  );
};
