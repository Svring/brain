import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { Copy, ExternalLink, Database, Check } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { Button } from "@/components/ui/button";
import BaseSystemMessage from "@/components/chat/messages/system-messages/components/base-system-message";
import { Checkbox } from "@/components/ui/checkbox";

interface ClusterConnectionMessageProps {
  target: CustomResourceTarget;
}

export const ClusterConnectionMessage: React.FC<
  ClusterConnectionMessageProps
> = ({ target }) => {
  const { copyToClipboard, isCopied } = useCopy();
  const [showPrivateConnection, setShowPrivateConnection] = useState(false);
  const [showPublicConnection, setShowPublicConnection] = useState(false);
  const [publicConnectionEnabled, setPublicConnectionEnabled] = useState(false);

  const { resource, isLoading, error } = useResourceStatus(target);
  const clusterObject = resource as ClusterObject;

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage
        headerTitle={{
          icon: Database,
          name: "Cluster Connection",
        }}
      >
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
      <BaseSystemMessage
        headerTitle={{
          icon: Database,
          name: "Cluster Connection",
        }}
      >
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load cluster connection information
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  const privateConnection = clusterObject.connection?.privateConnection;
  const {
    connectionString: privateConnectionString,
    host,
    port,
    username,
    password,
  } = privateConnection || {};

  const publicConnection = clusterObject.connection?.publicConnection;
  const publicConnectionString =
    publicConnection &&
    typeof publicConnection === "object" &&
    !Array.isArray(publicConnection)
      ? publicConnection.connectionString
      : null;

  return (
    <BaseSystemMessage
      headerTitle={{
        icon: Database,
        name: "Cluster Connection",
      }}
    >
      <div className="space-y-3">
        {/* Private Connection Section */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Host</span>
              <span className="text-base font-medium">{host}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Port</span>
              <span className="text-base font-medium">{port}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Username</span>
              <span className="text-base font-medium">{username}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Password</span>
              <span className="text-base font-medium">
                {password ? "••••••••" : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Private Connection String */}
        {privateConnectionString && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">
                Connection String
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
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
            <div className="flex items-center justify-between">
              <span
                className="text-base break-all flex-1 cursor-pointer select-none"
                onClick={() => setShowPrivateConnection(!showPrivateConnection)}
              >
                {showPrivateConnection
                  ? privateConnectionString
                  : "••••••••••••••••••••••••••••••••••••••••"}
              </span>
            </div>
          </div>
        )}

        {/* Public Connection Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium flex items-center gap-2">
              Public Connection
            </span>
            <Checkbox
              checked={publicConnectionEnabled}
              onCheckedChange={(checked) => setPublicConnectionEnabled(checked === true)}
              className="h-4 w-4"
            />
          </div>

          {/* Public Connection String (if available) */}
          {publicConnectionString && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">
                  Connection String
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
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
              <div className="flex items-center justify-between">
                <span
                  className="text-base break-all flex-1 cursor-pointer select-none"
                  onClick={() => setShowPublicConnection(!showPublicConnection)}
                >
                  {showPublicConnection
                    ? publicConnectionString
                    : "••••••••••••••••••••••••••••••••••••••••"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseSystemMessage>
  );
};

export default ClusterConnectionMessage;
