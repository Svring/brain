"use client";

import { ArrowBigUpDash, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface Release {
  id: string;
  tag: string;
  createTime: string;
}

interface DevboxNodeReleaseListProps {
  releases: Release[] | undefined;
  isLoading: boolean;
  onDeploy: (
    releaseTag: string,
    config: { cpu: number; memory: number }
  ) => Promise<void>;
  isDeploying: boolean;
  onDelete?: (releaseTag: string) => Promise<void>;
  isDeleting?: boolean;
}

export default function DevboxNodeReleaseList({
  releases,
  isLoading,
  onDeploy,
  isDeploying,
  onDelete,
  isDeleting = false,
}: DevboxNodeReleaseListProps) {
  const [deployConfig, setDeployConfig] = useState({
    cpu: 2000,
    memory: 4096,
  });
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [openDeletePopovers, setOpenDeletePopovers] = useState<
    Record<string, boolean>
  >({});

  const handleDeploy = async (releaseTag: string) => {
    try {
      await onDeploy(releaseTag, deployConfig);
      setOpenPopovers((prev) => ({ ...prev, [releaseTag]: false }));
    } catch (error) {
      console.error("Deploy failed:", error);
    }
  };

  const setPopoverOpen = (releaseTag: string, open: boolean) => {
    setOpenPopovers((prev) => ({ ...prev, [releaseTag]: open }));
  };

  const setDeletePopoverOpen = (releaseTag: string, open: boolean) => {
    setOpenDeletePopovers((prev) => ({ ...prev, [releaseTag]: open }));
  };

  const handleDelete = async (releaseTag: string) => {
    if (onDelete) {
      try {
        await onDelete(releaseTag);
        setDeletePopoverOpen(releaseTag, false);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
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
    <ScrollArea className="flex-1">
      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <div className="text-xs text-muted-foreground">Loading...</div>
        </div>
      ) : releases && releases.length > 0 ? (
        <div className="space-y-2">
          {releases.map((release) => (
            <div
              key={release.id}
              className="border rounded-lg p-2 hover:bg-muted/50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium truncate">
                      {release.tag}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(release.createTime)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Popover
                    open={openPopovers[release.tag] || false}
                    onOpenChange={(open) => setPopoverOpen(release.tag, open)}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                      >
                        <ArrowBigUpDash className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-80 z-[9999]"
                      side="top"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeployConfig((prev) => ({
                                      ...prev,
                                      cpu,
                                    }));
                                  }}
                                  variant={deployConfig.cpu === cpu ? "default" : "outline"}
                                  size="sm"
                                  className="h-7 text-xs"
                                >
                                  {cpu}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-xs">
                              Memory (MB)
                            </Label>
                            <div className="grid grid-cols-3 gap-1">
                              {[1024, 2048, 4096, 8192, 16384].map((memory) => (
                                <Button
                                  key={memory}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeployConfig((prev) => ({
                                      ...prev,
                                      memory,
                                    }));
                                  }}
                                  variant={deployConfig.memory === memory ? "default" : "outline"}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setPopoverOpen(release.tag, false);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeploy(release.tag);
                            }}
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            disabled={isDeploying}
                          >
                            {isDeploying ? "Deploying..." : "Deploy"}
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
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              disabled={!onDelete}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="bg-background-secondary rounded-lg z-[9999]"
                          >
                            <span className="text-xs">Delete</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-80 z-[9999]"
                      side="top"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
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
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDeletePopoverOpen(release.tag, false);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(release.tag);
                            }}
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
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
  );
}
