import React from "react";
import { Plus, Tag, Clock, ArrowBigUpDash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDevboxRelease } from "@/hooks/sealos/devbox/use-devbox-release";
import { useDevboxDeploy } from "@/hooks/sealos/devbox/use-devbox-deploy";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

// Types
interface ReleaseConfig {
  tag: string;
  releaseDes: string;
}

interface DeployConfig {
  cpu: number;
  memory: number;
}

interface Release {
  id: string;
  tag: string;
  createTime: string;
  status?: {
    value: string;
    label: string;
  };
}

// DevboxReleaseHeader Component
interface DevboxReleaseHeaderProps {
  devboxName: string;
  releaseCount: number;
  isReleasePopoverOpen: boolean;
  setIsReleasePopoverOpen: (open: boolean) => void;
  children: React.ReactNode;
}

const DevboxReleaseHeader: React.FC<DevboxReleaseHeaderProps> = ({
  devboxName,
  releaseCount,
  isReleasePopoverOpen,
  setIsReleasePopoverOpen,
  children,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-foreground text-lg">
          Releases of {devboxName}
        </h3>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
          {releaseCount} release{releaseCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Popover
          open={isReleasePopoverOpen}
          onOpenChange={setIsReleasePopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 z-[9999]" side="top">
            {children}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

// CreateReleaseForm Component
interface CreateReleaseFormProps {
  devboxName: string;
  releaseConfig: ReleaseConfig;
  setReleaseConfig: (config: ReleaseConfig) => void;
  onCancel: () => void;
  onSubmit: (config: ReleaseConfig) => void;
  isPending: boolean;
}

const CreateReleaseForm: React.FC<CreateReleaseFormProps> = ({
  devboxName,
  releaseConfig,
  setReleaseConfig,
  onCancel,
  onSubmit,
  isPending,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Create Release</h4>
        <p className="text-xs text-muted-foreground">
          Create a new release for {devboxName}
        </p>
      </div>
      <div className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="release-tag" className="text-xs">
            Tag *
          </Label>
          <Input
            id="release-tag"
            type="text"
            placeholder="v1.0.0"
            value={releaseConfig.tag}
            onChange={(e) =>
              setReleaseConfig({
                ...releaseConfig,
                tag: e.target.value,
              })
            }
            className="h-8 text-xs"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="release-description" className="text-xs">
            Description
          </Label>
          <Input
            id="release-description"
            type="text"
            placeholder="Release description (optional)"
            value={releaseConfig.releaseDes}
            onChange={(e) =>
              setReleaseConfig({
                ...releaseConfig,
                releaseDes: e.target.value,
              })
            }
            className="h-8 text-xs"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs"
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(releaseConfig)}
          size="sm"
          className="flex-1 h-8 text-xs"
          disabled={isPending || !releaseConfig.tag.trim()}
        >
          {isPending ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
};

// DeployConfigPopover Component
interface DeployConfigPopoverProps {
  releaseTag: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deployConfig: DeployConfig;
  setDeployConfig: (config: DeployConfig) => void;
  onDeploy: (releaseTag: string, config: DeployConfig) => void;
  isPending: boolean;
  isDisabled?: boolean;
}

const DeployConfigPopover: React.FC<DeployConfigPopoverProps> = ({
  releaseTag,
  isOpen,
  onOpenChange,
  deployConfig,
  setDeployConfig,
  onDeploy,
  isPending,
  isDisabled = false,
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          disabled={isDisabled}
        >
          <ArrowBigUpDash className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 z-[9999] bg-node-background"
        side="top"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Deploy Configuration</h4>
            <p className="text-xs text-muted-foreground">
              Configure deployment settings for {releaseTag}
            </p>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label className="text-xs">CPU (millicores)</Label>
              <div className="grid grid-cols-3 gap-1">
                {[1000, 2000, 4000, 8000, 16000].map((cpu) => (
                  <Button
                    key={cpu}
                    onClick={() => {
                      setDeployConfig({
                        ...deployConfig,
                        cpu,
                      });
                    }}
                    variant={
                      deployConfig.cpu === cpu ? "default" : "outline"
                    }
                    size="sm"
                    className="h-7 text-xs"
                  >
                    {cpu}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Memory (MB)</Label>
              <div className="grid grid-cols-3 gap-1">
                {[1024, 2048, 4096, 8192, 16384].map((memory) => (
                  <Button
                    key={memory}
                    onClick={() => {
                      setDeployConfig({
                        ...deployConfig,
                        memory,
                      });
                    }}
                    variant={
                      deployConfig.memory === memory ? "default" : "outline"
                    }
                    size="sm"
                    className="h-7 text-xs"
                  >
                    {memory}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onDeploy(releaseTag, deployConfig)}
              size="sm"
              className="flex-1 h-8 text-xs"
              disabled={isPending || isDisabled}
            >
              {isPending ? "Deploying..." : "Deploy"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// DeleteReleasePopover Component
interface DeleteReleasePopoverProps {
  releaseTag: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (releaseTag: string) => void;
  isPending: boolean;
  isDisabled?: boolean;
}

const DeleteReleasePopover: React.FC<DeleteReleasePopoverProps> = ({
  releaseTag,
  isOpen,
  onOpenChange,
  onDelete,
  isPending,
  isDisabled = false,
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          disabled={isDisabled}
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 z-[9999] bg-node-background"
        side="top"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-destructive">
              Delete Release
            </h4>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete release {releaseTag}? This action
              cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onDelete(releaseTag)}
              variant="destructive"
              size="sm"
              disabled={isPending || isDisabled}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ReleaseItem Component
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

const ReleaseItem: React.FC<ReleaseItemProps> = ({
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

// ReleaseList Component
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

const ReleaseList: React.FC<ReleaseListProps> = ({
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

// Main Component
interface DevboxReleaseMessageProps {
  payload: CustomResourceTarget;
}

export const DevboxReleaseMessage: React.FC<DevboxReleaseMessageProps> = ({
  payload,
}) => {
  const { name: devboxName } = payload;

  // Early return if devboxName is undefined
  if (!devboxName) {
    return (
      <div className="p-4 bg-node-background border border-border-primary rounded-xl">
        <div className="text-sm text-muted-foreground">Invalid devbox name</div>
      </div>
    );
  }

  // Use separate hooks for release and deploy logic
  const {
    releaseConfig,
    openDeletePopovers,
    isReleasePopoverOpen,
    releases,
    isLoading,
    releaseMutation,
    deleteReleaseMutation,
    handleRelease,
    handleDeleteRelease,
    setDeletePopoverOpen,
    setIsReleasePopoverOpen,
    setReleaseConfig,
    resetReleaseConfig,
  } = useDevboxRelease(devboxName);

  const {
    deployConfig,
    openPopovers,
    deployDevbox,
    handleDeploy,
    setPopoverOpen,
    setDeployConfig,
  } = useDevboxDeploy(devboxName);

  const releaseCount = releases?.data?.length || 0;

  return (
    <div className="p-4 bg-node-background border border-border-primary rounded-xl space-y-4">
      <DevboxReleaseHeader
        devboxName={devboxName}
        releaseCount={releaseCount}
        isReleasePopoverOpen={isReleasePopoverOpen}
        setIsReleasePopoverOpen={setIsReleasePopoverOpen}
      >
        <CreateReleaseForm
          devboxName={devboxName}
          releaseConfig={releaseConfig}
          setReleaseConfig={setReleaseConfig}
          onCancel={() => {
            setIsReleasePopoverOpen(false);
            resetReleaseConfig();
          }}
          onSubmit={handleRelease}
          isPending={releaseMutation.isPending}
        />
      </DevboxReleaseHeader>

      <ReleaseList
        releases={releases?.data || []}
        isLoading={isLoading}
        deployConfig={deployConfig}
        setDeployConfig={setDeployConfig}
        openPopovers={openPopovers}
        openDeletePopovers={openDeletePopovers}
        setPopoverOpen={setPopoverOpen}
        setDeletePopoverOpen={setDeletePopoverOpen}
        onDeploy={handleDeploy}
        onDelete={handleDeleteRelease}
        deployMutationPending={deployDevbox.isPending}
        deleteMutationPending={deleteReleaseMutation.isPending}
      />
    </div>
  );
};

export default DevboxReleaseMessage;
