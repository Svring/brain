import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Database } from "lucide-react";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { BaseSystemMessage } from "@/components/chat/messages/components/base-system-message";

interface ClusterInfoConnectionProps {
  payload: CustomResourceTarget;
}

export const ClusterInfoConnection: React.FC<ClusterInfoConnectionProps> = ({
  payload,
}) => {
  const { resource, isLoading, error } = useResourceStatus(payload);

  // Type guard to check if the resource is a ClusterObject
  const isClusterObject = (obj: any): obj is ClusterObject => {
    return (
      obj && typeof obj === "object" && "connection" in obj && "type" in obj
    );
  };

  const clusterData = isClusterObject(resource) ? resource : null;

  const getConnectionString = () => {
    if (!clusterData) return null;

    // Check if connection object exists and has any connection data
    if (clusterData.connection?.privateConnection) {
      return clusterData.connection.privateConnection;
    }
    return null;
  };

  const formatConnectionString = (connection: any, dbType: string) => {
    const { host, port, username, password } = connection;

    switch (dbType.toLowerCase()) {
      case "postgresql":
        return `postgresql://${username}:${password}@${host}:${port}`;
      case "mongodb":
        return `mongodb://${username}:${password}@${host}:${port}`;
      case "redis":
        return `redis://${username}:${password}@${host}:${port}`;
      case "mysql":
      case "apecloud-mysql":
        return `mysql://${username}:${password}@${host}:${port}`;
      case "kafka":
        return `${host}:${port}`;
      default:
        return `${host}:${port}`;
    }
  };

  const getConnectionStringLabel = (dbType: string) => {
    switch (dbType.toLowerCase()) {
      case "postgresql":
        return "PostgreSQL Connection String";
      case "mongodb":
        return "MongoDB Connection String";
      case "redis":
        return "Redis Connection String";
      case "mysql":
      case "apecloud-mysql":
        return "MySQL Connection String";
      case "kafka":
        return "Kafka Endpoint";
      default:
        return "Connection String";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={payload}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading connection information...
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !clusterData) {
    return (
      <BaseSystemMessage target={payload}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load connection information
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  const connection = getConnectionString();

  if (!connection) {
    return (
      <BaseSystemMessage target={payload}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            No connection information available
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage target={payload}>
      <div className="space-y-4 p-4 border border-dashed rounded-lg">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <h4 className="font-medium">Connection Details</h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Host:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">{connection.host}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => navigator.clipboard.writeText(connection.host)}
                title="Copy host"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Port:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">{connection.port}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() =>
                  navigator.clipboard.writeText(connection.port.toString())
                }
                title="Copy port"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {connection.username && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Username:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">{connection.username}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    navigator.clipboard.writeText(connection.username)
                  }
                  title="Copy username"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {connection.password && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Password:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">••••••••</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    navigator.clipboard.writeText(connection.password)
                  }
                  title="Copy password"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">Endpoint:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">{connection.endpoint}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() =>
                  navigator.clipboard.writeText(connection.endpoint)
                }
                title="Copy endpoint"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              {getConnectionStringLabel(clusterData.type)}:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono max-w-[300px] truncate">
                {formatConnectionString(connection, clusterData.type)}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  navigator.clipboard.writeText(
                    formatConnectionString(connection, clusterData.type)
                  )
                }
                title="Copy connection string"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BaseSystemMessage>
  );
};
