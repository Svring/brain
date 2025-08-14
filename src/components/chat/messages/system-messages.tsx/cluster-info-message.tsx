import React from "react";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Copy,
  Database,
  Server
} from "lucide-react";

interface ClusterInfoMessageProps {
  payload: ClusterObject;
}

export const ClusterInfoMessageCard: React.FC<ClusterInfoMessageProps> = ({
  payload,
}) => {
  const iconUrl = CLUSTER_TYPE_ICON_MAP[payload.type as keyof typeof CLUSTER_TYPE_ICON_MAP];
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-800 border-green-200";
      case "updating":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "stopped":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getConnectionString = () => {
    // Check if connection object exists and has any connection data
    if (payload.connection?.privateConnection) {
      return payload.connection.privateConnection;
    }
    return null;
  };

  const connection = getConnectionString();

  return (
    <div className="p-4 bg-node-background border rounded-xl w-full space-y-4">
      {/* Header with icon, name, type, and status */}
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
              <Badge 
                variant="outline" 
                className={`${getStatusColor(payload.status)} border text-xs`}
              >
                {payload.status}
              </Badge>
            )}
          </div>
          <span className="text-lg font-bold text-foreground leading-tight truncate">
            {payload.name}
          </span>
        </div>
      </div>

      {/* Resource Configuration Row */}
      {payload.resource && (
        <div className="grid grid-cols-4 gap-3 p-3 bg-background/50 rounded-lg">
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
        <div className="p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-foreground">Connection</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded border">
            <span className="text-sm font-mono text-foreground flex-1">
              {connection.host}:{connection.port}
            </span>
            <button 
              onClick={() => navigator.clipboard.writeText(`${connection.host}:${connection.port}`)}
              className="p-1 hover:bg-background rounded"
              title="Copy connection string"
            >
              <Copy className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          {connection.username && (
            <div className="mt-2 text-xs text-muted-foreground">
              Username: {connection.username}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClusterInfoMessageCard;
