import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { Copy, ExternalLink, Database, Check } from "lucide-react";
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

  const { resource, isLoading, error } = useResourceStatus(target);
  const clusterObject = resource as ClusterObject;

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

  const {
    privateConnection: {
      connectionString: privateConnectionString,
      host,
      port,
      username,
      password,
      endpoint,
    },
  } = clusterObject.connection;

  const publicConnectionString = clusterObject.connection.publicConnection
    ? clusterObject.connection.publicConnection.connectionString
    : null;

  return (
    <BaseSystemMessage target={target}>
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
              <span className="text-sm font-medium">{host}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Port</span>
              <span className="text-sm font-medium">{port}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Username</span>
              <span className="text-sm font-medium">{username}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Password</span>
              <span className="text-sm font-medium">
                {password ? "••••••••" : "N/A"}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Endpoint</span>
            <span className="text-sm font-medium break-all">{endpoint}</span>
          </div>
        </div>

        {/* Private Connection String */}
        {privateConnectionString && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground font-medium">
              Private Connection String
            </span>
            <div className="bg-muted p-3 rounded-md flex items-center justify-between">
              <code className="text-sm break-all flex-1">
                {privateConnectionString}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                onClick={() =>
                  copyToClipboard(
                    privateConnectionString,
                    "private-connection-string"
                  )
                }
              >
                {isCopied("private-connection-string") ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Public Connection Section (if available) */}
        {publicConnectionString && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Public Connection
            </h3>
          </div>
        )}

        {/* Public Connection String (if available) */}
        {publicConnectionString && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground font-medium">
              Public Connection String
            </span>
            <div className="bg-muted p-3 rounded-md flex items-center justify-between">
              <code className="text-sm break-all flex-1">
                {publicConnectionString}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                onClick={() =>
                  copyToClipboard(
                    publicConnectionString,
                    "public-connection-string"
                  )
                }
              >
                {isCopied("public-connection-string") ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseSystemMessage>
  );
};

export default ClusterConnectionMessage;
