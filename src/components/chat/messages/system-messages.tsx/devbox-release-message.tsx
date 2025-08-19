import React, { useState } from "react";
import { ArrowBigUpDash, Tag, Trash2, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { createK8sContext } from "@/lib/auth/auth-utils";
import { createDevboxContext } from "@/lib/auth/auth-utils";
import { getDevboxReleasesOptions } from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import { useQuery } from "@tanstack/react-query";
import {
  useDeployDevboxMutation,
  useReleaseDevboxMutation,
  useDeleteDevboxReleaseMutation,
} from "@/lib/sealos/resources/devbox/devbox-method/devbox-mutation";
import { useAddToProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useProjectState } from "@/contexts/project/project-context";

interface Release {
  id: string;
  tag: string;
  createTime: string;
  status?: {
    value: string;
    label: string;
  };
}

interface DevboxReleaseMessageProps {
  payload: {
    devboxName: string;
  };
}

export const DevboxReleaseMessageCard: React.FC<DevboxReleaseMessageProps> = ({
  payload,
}) => {
  const { devboxName } = payload;
  const devboxContext = createDevboxContext();
  const k8sContext = createK8sContext();
  const { selectedProject } = useProjectState();

  const [releaseConfig, setReleaseConfig] = useState({
    tag: "",
    releaseDes: "",
  });
  const [deployConfig, setDeployConfig] = useState({
    cpu: 2000,
    memory: 4096,
  });
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [openDeletePopovers, setOpenDeletePopovers] = useState<
    Record<string, boolean>
  >({});
  const [isReleasePopoverOpen, setIsReleasePopoverOpen] = useState(false);

  // Fetch devbox releases
  const { data: releases, isLoading } = useQuery(
    getDevboxReleasesOptions(devboxContext, devboxName)
  );

  const deployMutation = useDeployDevboxMutation(devboxContext);
  const releaseMutation = useReleaseDevboxMutation(devboxContext);
  const deleteReleaseMutation = useDeleteDevboxReleaseMutation(devboxContext);
  const addToProjectMutation = useAddToProjectMutation(k8sContext);

  const handleDeploy = async (
    releaseTag: string,
    config: { cpu: number; memory: number }
  ) => {
    try {
      const deployResult = await deployMutation.mutateAsync({
        devboxName,
        tag: releaseTag,
        cpu: config.cpu,
        memory: config.memory,
      });

      const target = BuiltinResourceTargetSchema.parse(
        convertResourceTypeToTarget("deployment", deployResult.data.appName)
      );

      if (selectedProject) {
        await addToProjectMutation.mutateAsync({
          resources: [target],
          name: selectedProject,
        });
      }

      setOpenPopovers((prev) => ({ ...prev, [releaseTag]: false }));
    } catch (error) {
      console.error("Deploy failed:", error);
    }
  };

  const handleRelease = async (config: { tag: string; releaseDes: string }) => {
    try {
      await releaseMutation.mutateAsync({
        devboxName,
        tag: config.tag,
        releaseDes: config.releaseDes,
      });

      setIsReleasePopoverOpen(false);
      setReleaseConfig({ tag: "", releaseDes: "" });
    } catch (error) {
      console.error("Release failed:", error);
    }
  };

  const handleDeleteRelease = async (releaseTag: string) => {
    try {
      const versionName = `${devboxName}-${releaseTag}`;
      await deleteReleaseMutation.mutateAsync(versionName);

      setDeletePopoverOpen(releaseTag, false);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const setPopoverOpen = (releaseTag: string, open: boolean) => {
    setOpenPopovers((prev) => ({ ...prev, [releaseTag]: open }));
  };

  const setDeletePopoverOpen = (releaseTag: string, open: boolean) => {
    setOpenDeletePopovers((prev) => ({ ...prev, [releaseTag]: open }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 bg-node-background border border-border-primary rounded-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground text-lg">
            Releases of {devboxName}
          </h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            {releases?.data?.length || 0} release
            {(releases?.data?.length || 0) !== 1 ? "s" : ""}
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
                        setReleaseConfig((prev) => ({
                          ...prev,
                          tag: e.target.value,
                        }))
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
                        setReleaseConfig((prev) => ({
                          ...prev,
                          releaseDes: e.target.value,
                        }))
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsReleasePopoverOpen(false);
                      setReleaseConfig({ tag: "", releaseDes: "" });
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleRelease(releaseConfig)}
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    disabled={
                      releaseMutation.isPending || !releaseConfig.tag.trim()
                    }
                  >
                    {releaseMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Releases List */}
      <ScrollArea className="flex-1 max-h-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="text-xs text-muted-foreground">Loading...</div>
          </div>
        ) : releases?.data && releases.data.length > 0 ? (
          <div className="space-y-2">
            {releases.data.map((release) => (
              <div
                key={release.id}
                className="border rounded-lg p-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium truncate">
                        {release.tag}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          {formatDate(release.createTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Status indicator */}
                    {release.status?.value === "Pending" && (
                      <span className="text-xs text-amber-500 font-medium">
                        Pending
                      </span>
                    )}
                    <Popover
                      open={openPopovers[release.tag] || false}
                      onOpenChange={(open) => setPopoverOpen(release.tag, open)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          disabled={release.status?.value === "Pending"}
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
                            <h4 className="font-medium text-sm">
                              Deploy Configuration
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Configure deployment settings for {release.tag}
                            </p>
                          </div>
                          <div className="grid gap-3">
                            <div className="grid gap-2">
                              <Label className="text-xs">
                                CPU (millicores)
                              </Label>
                              <div className="grid grid-cols-3 gap-1">
                                {[1000, 2000, 4000, 8000, 16000].map((cpu) => (
                                  <Button
                                    key={cpu}
                                    onClick={() => {
                                      setDeployConfig((prev) => ({
                                        ...prev,
                                        cpu,
                                      }));
                                    }}
                                    variant={
                                      deployConfig.cpu === cpu
                                        ? "default"
                                        : "outline"
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
                                {[1024, 2048, 4096, 8192, 16384].map(
                                  (memory) => (
                                    <Button
                                      key={memory}
                                      onClick={() => {
                                        setDeployConfig((prev) => ({
                                          ...prev,
                                          memory,
                                        }));
                                      }}
                                      variant={
                                        deployConfig.memory === memory
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      className="h-7 text-xs"
                                    >
                                      {memory}
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setPopoverOpen(release.tag, false)}
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() =>
                                handleDeploy(release.tag, deployConfig)
                              }
                              size="sm"
                              className="flex-1 h-8 text-xs"
                              disabled={
                                deployMutation.isPending ||
                                release.status?.value === "Pending"
                              }
                            >
                              {deployMutation.isPending
                                ? "Deploying..."
                                : "Deploy"}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Popover
                      open={openDeletePopovers[release.tag] || false}
                      onOpenChange={(open) =>
                        setDeletePopoverOpen(release.tag, open)
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          disabled={
                            !release.status ||
                            release.status.value === "Pending"
                          }
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
                              Are you sure you want to delete release{" "}
                              {release.tag}? This action cannot be undone.
                            </p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() =>
                                setDeletePopoverOpen(release.tag, false)
                              }
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleDeleteRelease(release.tag)}
                              variant="destructive"
                              size="sm"
                              disabled={
                                deleteReleaseMutation.isPending ||
                                release.status?.value === "Pending"
                              }
                            >
                              {deleteReleaseMutation.isPending
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-20 text-center">
            <ArrowBigUpDash className="h-6 w-6 text-muted-foreground mb-2" />
            <div className="text-xs text-muted-foreground">No releases yet</div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DevboxReleaseMessageCard;
