import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { devboxClient } from "@/components/provider/trpc-provider";
import BaseActionMessage from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import {
  Play,
  Trash2,
  Calendar,
  Tag,
  ArrowBigUpDash,
  Plus,
  Check,
  X,
} from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import {
  DevboxReleaseItem,
  DevboxReleaseRequestSchema,
} from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas/devbox-release-schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";

interface DevboxReleaseMessageProps {
  target: CustomResourceTarget;
}

const ReleaseItem: React.FC<{
  release: DevboxReleaseItem;
  target: CustomResourceTarget;
  onDelete: (versionName: string) => void;
  isDeleting?: boolean;
}> = ({ release, target, onDelete, isDeleting = false }) => {
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  // console.log("release", release);

  const handleDeploy = () => {
    appendSystemMessage({
      type: "devbox.deployment",
      target,
      payload: { tag: release.tag },
    });
  };

  const handleDelete = () => {
    onDelete(release.name);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="border rounded-lg p-2 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Tag className="h-3 w-3 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs font-medium truncate">{release.tag}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(release.createTime)}
            </span>
          </div>
          {/* Status indicator next to tag */}
          {release.status?.value === "Success" ? (
            <Check className="h-3 w-3 text-theme-green" />
          ) : (
            <Spinner className="h-3 w-3 text-theme-yellow" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="p-0 border border-border-primary bg-background-tertiary hover:brightness-150"
            onClick={handleDeploy}
            disabled={release.status?.value !== "Success"}
            title="Deploy"
          >
            <ArrowBigUpDash className="h-4 w-4" />
            Deploy
          </Button>
          <Button
            variant="destructive"
            className="p-0 h-8 w-8 hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete"
          >
            {isDeleting ? (
              <Spinner className="h-3 w-3" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Release note section with border */}
      <div className="border-t border-dashed pt-2">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Release Notes:</span>{" "}
          <span className="rounded">
            {release.description || "No release notes available"}
          </span>
        </div>
      </div>
    </div>
  );
};

export const DevboxReleaseMessage: React.FC<DevboxReleaseMessageProps> = ({
  target,
}) => {
  const devboxTrpcClient = devboxClient.useTRPC();
  const queryClient = useQueryClient();
  const [isCreatingRelease, setIsCreatingRelease] = useState(false);
  const [newReleaseTag, setNewReleaseTag] = useState("");
  const [newReleaseDescription, setNewReleaseDescription] = useState("");
  const [deletingReleaseId, setDeletingReleaseId] = useState<string | null>(
    null
  );

  const {
    data: releasesData,
    isLoading,
    error,
  } = useQuery(
    devboxTrpcClient.getDevboxReleases.queryOptions(target.name || "")
  );

  const pauseMutation = useMutation({
    ...devboxTrpcClient.pauseDevbox.mutationOptions(),
  });

  const startMutation = useMutation({
    ...devboxTrpcClient.startDevbox.mutationOptions(),
    onSuccess: () => {
      // Invalidate and refetch releases
      queryClient.invalidateQueries({
        queryKey: devboxTrpcClient.getDevboxReleases.queryKey(
          target.name || ""
        ),
      });
      setIsCreatingRelease(false);
      setNewReleaseTag("");
      setNewReleaseDescription("");
    },
    onError: (error) => {
      console.error("Failed to start devbox after release:", error);
    },
  });

  const releaseMutation = useMutation({
    ...devboxTrpcClient.releaseDevbox.mutationOptions(),
    onSuccess: () => {
      // Start the devbox after successful release
      startMutation.mutate(target.name || "");
    },
    onError: (error) => {
      console.error("Failed to create release:", error);
    },
  });

  const deleteReleaseMutation = useMutation({
    ...devboxTrpcClient.deleteDevboxRelease.mutationOptions(),
    onSuccess: () => {
      // Invalidate and refetch releases
      queryClient.invalidateQueries({
        queryKey: devboxTrpcClient.getDevboxReleases.queryKey(
          target.name || ""
        ),
      });
      setDeletingReleaseId(null);
    },
    onError: (error) => {
      console.error("Failed to delete release:", error);
      setDeletingReleaseId(null);
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <BaseActionMessage headerTitle={{ icon: Tag, name: "Devbox Releases" }}>
        <div className="flex items-center justify-center h-20">
          <div className="text-xs text-muted-foreground">Loading...</div>
        </div>
      </BaseActionMessage>
    );
  }

  // Show error state
  if (error || !releasesData) {
    return (
      <BaseActionMessage headerTitle={{ icon: Tag, name: "Devbox Releases" }}>
        <div className="flex items-center justify-center h-20">
          <span className="text-destructive text-xs">
            Failed to load devbox releases
          </span>
        </div>
      </BaseActionMessage>
    );
  }

  const releases = (releasesData as any)?.data || [];

  return (
    <BaseActionMessage headerTitle={{ icon: Tag, name: "Devbox Releases" }}>
      <div className="space-y-3">
        {releases.length > 0 && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Releases: {releases.length}</h3>
          </div>
        )}

        {releases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-center">
            <ArrowBigUpDash className="h-6 w-6 text-muted-foreground mb-2" />
            <div className="text-xs text-muted-foreground">No releases yet</div>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-2">
              {releases.map((release: DevboxReleaseItem) => (
                <ReleaseItem
                  key={release.id}
                  release={release}
                  target={target}
                  onDelete={(versionName) => {
                    setDeletingReleaseId(release.id);
                    deleteReleaseMutation.mutate(versionName);
                  }}
                  isDeleting={deletingReleaseId === release.id}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Add new release section - fixed at bottom */}
        {!isCreatingRelease ? (
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
            onClick={() => setIsCreatingRelease(true)}
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Add new release
              </span>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Release tag"
                value={newReleaseTag}
                onChange={(e) => setNewReleaseTag(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Input
                placeholder="Description"
                value={newReleaseDescription}
                onChange={(e) => setNewReleaseDescription(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Button
                size="sm"
                variant="default"
                className="h-8 w-8 p-0"
                onClick={() => {
                  if (newReleaseTag.trim()) {
                    // First pause the devbox, then release it
                    pauseMutation.mutate(target.name || "", {
                      onSuccess: () => {
                        releaseMutation.mutate({
                          devboxName: target.name || "",
                          tag: newReleaseTag.trim(),
                          releaseDes: newReleaseDescription.trim(),
                        });
                      },
                    });
                  }
                }}
                disabled={
                  !newReleaseTag.trim() ||
                  pauseMutation.isPending ||
                  releaseMutation.isPending ||
                  startMutation.isPending
                }
                title="Create release"
              >
                {pauseMutation.isPending ||
                releaseMutation.isPending ||
                startMutation.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setIsCreatingRelease(false);
                  setNewReleaseTag("");
                  setNewReleaseDescription("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseActionMessage>
  );
};

export default DevboxReleaseMessage;
