import React from "react";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Copy,
  Database,
  Server,
  Monitor,
  Save,
  FileText,
  Container
} from "lucide-react";
import { useEmitSystemMessage } from "@/lib/copilot/message/message-utils";

interface ClusterInfoMessageProps {
  payload: ClusterObject;
}

export const ClusterInfoMessageCard: React.FC<ClusterInfoMessageProps> = ({
  payload,
}) => {
  const { emitMessage } = useEmitSystemMessage();
  
  const iconUrl = CLUSTER_TYPE_ICON_MAP[payload.type as keyof typeof CLUSTER_TYPE_ICON_MAP];
  
  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "default";
      case "updating":
        return "secondary";
      case "stopped":
        return "outline";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getConnectionString = () => {
    // Check if connection object exists and has any connection data
    if (payload.connection?.privateConnection) {
      return payload.connection.privateConnection;
    }
    return null;
  };

  const formatConnectionString = (connection: any, dbType: string) => {
    const { host, port, username, password } = connection;
    
    switch (dbType.toLowerCase()) {
      case 'postgresql':
        return `postgresql://${username}:${password}@${host}:${port}`;
      case 'mongodb':
        return `mongodb://${username}:${password}@${host}:${port}`;
      case 'redis':
        return `redis://${username}:${password}@${host}:${port}`;
      case 'mysql':
      case 'apecloud-mysql':
        return `mysql://${username}:${password}@${host}:${port}`;
      case 'kafka':
        return `${host}:${port}`;
      default:
        return `${host}:${port}`;
    }
  };

  const getConnectionStringLabel = (dbType: string) => {
    switch (dbType.toLowerCase()) {
      case 'postgresql':
        return 'PostgreSQL Connection String';
      case 'mongodb':
        return 'MongoDB Connection String';
      case 'redis':
        return 'Redis Connection String';
      case 'mysql':
      case 'apecloud-mysql':
        return 'MySQL Connection String';
      case 'kafka':
        return 'Kafka Endpoint';
      default:
        return 'Connection String';
    }
  };

  const connection = getConnectionString();

  const handleBackupClick = () => {
    emitMessage(
      `Fetching backups for your ${payload.type} cluster "${payload.name}"...`,
      {
        type: "info.clusterBackup",
        payload: {
          clusterName: payload.name,
          backups: [], // The system will fetch and populate this
        },
      }
    );
  };

  const handlePodsClick = () => {
    emitMessage(
      `Displaying pods for your ${payload.type} cluster "${payload.name}":`,
      {
        type: "info.pod",
        payload: {
          pods: payload.pods || [],
          resourceName: payload.name,
          resourceType: payload.type,
        },
      }
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Image
            src={iconUrl || "https://dbprovider.bja.sealos.run/logo.svg"}
            alt={`${payload.type} Icon`}
            width={32}
            height={32}
            className="rounded-lg h-8 w-8 flex-shrink-0"
            priority
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {payload.type.charAt(0).toUpperCase() + payload.type.slice(1)}
              </span>
              {payload.status && (
                <Badge variant={getStatusVariant(payload.status)}>
                  {payload.status}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight truncate">
              {payload.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resource Configuration Row */}
        {payload.resource && (
          <div className="grid grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex flex-col items-center text-center">
              <Cpu className="w-4 h-4 text-blue-600 mb-1" />
              <span className="text-xs text-muted-foreground">CPU</span>
              <span className="text-sm font-medium">{payload.resource.cpu}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <MemoryStick className="w-4 h-4 text-green-600 mb-1" />
              <span className="text-xs text-muted-foreground">Memory</span>
              <span className="text-sm font-medium">{payload.resource.memory}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <HardDrive className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-xs text-muted-foreground">Storage</span>
              <span className="text-sm font-medium">{payload.resource.storage}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Server className="w-4 h-4 text-purple-600 mb-1" />
              <span className="text-xs text-muted-foreground">Replicas</span>
              <span className="text-sm font-medium">{payload.resource.replicas}</span>
            </div>
          </div>
        )}

        {/* Connection String */}
        {connection && (
          <>
            <Separator />
            <div className="space-y-3">
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
                      onClick={() => navigator.clipboard.writeText(connection.port.toString())}
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
                        onClick={() => navigator.clipboard.writeText(connection.username)}
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
                        onClick={() => navigator.clipboard.writeText(connection.password)}
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
                      onClick={() => navigator.clipboard.writeText(connection.endpoint)}
                      title="Copy endpoint"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">{getConnectionStringLabel(payload.type)}:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono max-w-[300px] truncate">
                      {formatConnectionString(connection, payload.type)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(formatConnectionString(connection, payload.type))}
                      title="Copy connection string"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <Separator />
        <div className="flex gap-3 pt-2">
          <Button className="flex-1" variant="outline" size="sm">
            <Monitor className="w-4 h-4 mr-2" />
            Monitor
          </Button>
          <Button className="flex-1" variant="outline" size="sm" onClick={handleBackupClick}>
            <Save className="w-4 h-4 mr-2" />
            Backup
          </Button>
          <Button className="flex-1" variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Logs
          </Button>
          <Button className="flex-1" variant="outline" size="sm" onClick={handlePodsClick}>
            <Container className="w-4 h-4 mr-2" />
            Pods
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClusterInfoMessageCard;
