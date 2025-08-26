import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { devboxClient } from "@/components/provider/trpc-provider";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import {
  Play,
  Trash2,
  Calendar,
  Tag,
  ArrowBigUpDash,
  Plus,
} from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { DevboxReleaseItem } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas/devbox-release-schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DevboxReleaseMessageProps {
  target: CustomResourceTarget;
}

const ReleaseItem: React.FC<{
  release: DevboxReleaseItem;
  target: CustomResourceTarget;
}> = ({ release, target }) => {
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const handleDeploy = () => {
    appendSystemMessage("devbox.deployment", target);
  };

  const handleDelete = () => {
    console.log("delete", release);
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
    <div className="border rounded-lg p-2 hover:brightness-150 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Tag className="h-3 w-3 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs font-medium truncate">{release.tag}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(release.createTime)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Status indicator */}
          {release.status?.value === "ready" && (
            <Badge variant="default" className="text-xs px-1.5 py-0.5">
              Ready
            </Badge>
          )}
          {release.status?.value === "pending" && (
            <span className="text-xs text-amber-500 font-medium">Pending</span>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="p-0 border border-border-primary"
            onClick={handleDeploy}
            disabled={release.status.value !== "ready"}
            title="Deploy"
          >
            <ArrowBigUpDash className="h-4 w-4" />
            Deploy
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="p-0 text-destructive hover:text-destructive"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const DevboxReleaseMessage: React.FC<DevboxReleaseMessageProps> = ({
  target,
}) => {
  const devboxTrpcClient = devboxClient.useTRPC();

  const {
    data: releasesData,
    isLoading,
    error,
  } = useQuery(
    devboxTrpcClient.getDevboxReleases.queryOptions(target.name || "")
  );

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center h-20">
          <div className="text-xs text-muted-foreground">Loading...</div>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !releasesData) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center h-20">
          <span className="text-destructive text-xs">
            Failed to load devbox releases
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  const releases = releasesData.data || [];

  return (
    <BaseSystemMessage target={target}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Releases: {releases.length}</h3>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => console.log("Create new release")}
            title="Create new release"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {releases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-center">
            <ArrowBigUpDash className="h-6 w-6 text-muted-foreground mb-2" />
            <div className="text-xs text-muted-foreground">No releases yet</div>
          </div>
        ) : (
          <ScrollArea className="max-h-60">
            <div className="space-y-2">
              {releases.map((release) => (
                <ReleaseItem
                  key={release.id}
                  release={release}
                  target={target}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </BaseSystemMessage>
  );
};

export default DevboxReleaseMessage;
