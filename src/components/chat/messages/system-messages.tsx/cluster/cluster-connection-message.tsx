import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { Copy, ExternalLink, Database, Check } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useCopy } from "@/hooks/use-copy";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { Button } from "@/components/ui/button";

interface ClusterConnectionMessageProps {
  target: CustomResourceTarget;
}

export const ClusterConnectionMessage: React.FC<
  ClusterConnectionMessageProps
> = ({ target }) => {
  const { copyToClipboard, isCopied } = useCopy();
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const { resource, isLoading, error } = useResourceStatus(target);
  const clusterObject = resource as ClusterObject;

  const actions: MessageAction[] =
    clusterObject && clusterObject.connection
      ? [
          {
            icon: Database,
            label: "View Details",
            onClick: () => {
              appendSystemMessage("cluster.detail", target);
            },
          },
        ]
      : [];

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading cluster connection information...
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !clusterObject || !clusterObject.connection) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load cluster connection information
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  const { privateConnection, publicConnection } = clusterObject.connection;

  return (
    <BaseSystemMessage target={target} actions={actions}>
      <div className="space-y-6">
        {/* Private Connection Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Private Connection
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Host</span>
              <span className="text-sm font-medium">
                {privateConnection.host}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Port</span>
              <span className="text-sm font-medium">
                {privateConnection.port}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Username</span>
              <span className="text-sm font-medium">
                {privateConnection.username}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Password</span>
              <span className="text-sm font-medium">
                {privateConnection.password ? "••••••••" : "N/A"}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Endpoint</span>
            <span className="text-sm font-medium break-all">
              {privateConnection.endpoint}
            </span>
          </div>
        </div>

        {/* Public Connection Section (if available) */}
        {publicConnection && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Public Connection
            </h3>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Port</span>
              <span className="text-sm font-medium">
                {publicConnection.port}
              </span>
            </div>
          </div>
        )}

        {/* Connection String */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">
            Connection String
          </span>
          <div className="bg-muted p-3 rounded-md flex items-center justify-between">
            <code className="text-sm break-all flex-1">
              {`${privateConnection.host}:${privateConnection.port}`}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 ml-2 flex-shrink-0"
              onClick={() =>
                copyToClipboard(
                  `${privateConnection.host}:${privateConnection.port}`,
                  "connection-string"
                )
              }
            >
              {isCopied("connection-string") ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </BaseSystemMessage>
  );
};

export default ClusterConnectionMessage;
