import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { devboxClient } from "@/components/provider/trpc-provider";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/message-actions";
import { Play, Trash2, Calendar, Tag } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { DevboxReleaseItem } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas/devbox-release-schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface DevboxReleaseMessageProps {
  target: CustomResourceTarget;
}

const ReleaseItem: React.FC<{ release: DevboxReleaseItem }> = ({ release }) => {
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const handleDeploy = () => {
    appendSystemMessage("devbox.deploy", {
      type: "custom" as const,
      resourceType: "devbox",
      group: "devbox.sealos.io",
      version: "v1",
      plural: "devboxes",
      name: release.devboxName,
    });
  };

  const handleDelete = () => {
    appendSystemMessage("devbox.deleteRelease", {
      type: "custom" as const,
      resourceType: "devbox",
      group: "devbox.sealos.io",
      version: "v1",
      plural: "devboxes",
      name: release.devboxName,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{release.tag}</span>
            <Badge 
              variant={release.status.value === "ready" ? "default" : "secondary"}
              className="text-xs"
            >
              {release.status.label}
            </Badge>
          </div>
          
          {release.description && (
            <p className="text-sm text-muted-foreground truncate">
              {release.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(release.createTime)}</span>
            </div>
            <span>ID: {release.id}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDeploy}
          disabled={release.status.value !== "ready"}
        >
          <Play className="h-4 w-4 mr-1" />
          Deploy
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const DevboxReleaseMessage: React.FC<DevboxReleaseMessageProps> = ({ target }) => {
  const devboxTrpcClient = devboxClient.useTRPC();

  const {
    data: releasesData,
    isLoading,
    error,
  } = useQuery(
    devboxTrpcClient.getDevboxReleases.queryOptions(target.name || "")
  );

  const actions: MessageAction[] = [
    {
      icon: Play,
      label: "Create Release",
      onClick: () => {
        // This would trigger a release creation flow
        console.log("Create release for:", target.name);
      },
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center py-8">
          <span className="text-muted-foreground">
            Loading devbox releases...
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !releasesData) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center py-8">
          <span className="text-destructive">
            Failed to load devbox releases
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  const releases = releasesData.data || [];

  return (
    <BaseSystemMessage target={target} actions={actions}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Devbox Releases</h3>
          <Badge variant="outline">
            {releases.length} release{releases.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {releases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No releases found for this devbox</p>
            <p className="text-sm">Create a release to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {releases.map((release) => (
              <ReleaseItem key={release.id} release={release} />
            ))}
          </div>
        )}
      </div>
    </BaseSystemMessage>
  );
};

export default DevboxReleaseMessage;
