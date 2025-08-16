import React from "react";
import { Rocket, Cpu, MemoryStick, Server, Globe, Clock, Monitor, FileText, Container } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEmitSystemMessage } from "@/lib/copilot/message/message-utils";

interface LaunchpadPort {
  port: number;
  protocol: string;
  appProtocol?: string;
  exposesPublicDomain: boolean;
  publicAddress?: string;
}

interface LaunchpadResource {
  cpu: number;
  memory: number;
  replicas: number;
}

interface LaunchpadInfoMessageProps {
  payload: {
    name?: string;
    image?: string;
    status?: string;
    resource?: LaunchpadResource;
    ports?: LaunchpadPort[];
    createTime?: string;
    kind?: string;
  };
}

export const LaunchpadInfoMessageCard: React.FC<LaunchpadInfoMessageProps> = ({
  payload,
}) => {
  const { emitMessage } = useEmitSystemMessage();
  
  const {
    name = "Unknown App",
    image = "Unknown Image",
    status = "Unknown",
    resource,
    ports = [],
    createTime,
    kind = "deployment"
  } = payload;

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "stopped":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMonitorClick = () => {
    emitMessage(
      `Opening monitoring for your ${kind} "${name}"...`,
      {
        type: "info.metrics",
        payload: {
          resourceName: name,
          resourceType: kind,
          resource: resource,
        },
      }
    );
  };

  const handleLogsClick = () => {
    emitMessage(
      `Fetching logs for your ${kind} "${name}"...`,
      {
        type: "info.logs",
        payload: {
          resourceName: name,
          resourceType: kind,
          resource: resource,
        },
      }
    );
  };

  const handlePodClick = () => {
    emitMessage(
      `Displaying pods for your ${kind} "${name}":`,
      {
        type: "info.pod",
        payload: {
          pods: [], // This will be populated by the system
          resourceName: name,
          resourceType: kind,
        },
      }
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-black rounded-full"></div>
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Rocket className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{kind}</span>
            </div>
          </div>
          <Badge variant={getStatusVariant(status)}>
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Image:</span>
              <span className="text-sm font-medium">{image}</span>
            </div>
            {createTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm font-medium">{formatDate(createTime)}</span>
              </div>
            )}
          </div>
          {resource && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">CPU:</span>
                <span className="text-sm font-medium">{resource.cpu}m</span>
              </div>
              <div className="flex items-center gap-2">
                <MemoryStick className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-muted-foreground">Memory:</span>
                <span className="text-sm font-medium">{resource.memory}MB</span>
              </div>
            </div>
          )}
        </div>

        {/* Resource Configuration */}
        {resource && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium">Resource Configuration</h4>
              </div>
              <div className="grid grid-cols-3 gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex flex-col items-center text-center">
                  <Cpu className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-xs text-muted-foreground">CPU</span>
                  <span className="text-sm font-medium">{resource.cpu}m</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <MemoryStick className="w-4 h-4 text-green-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Memory</span>
                  <span className="text-sm font-medium">{resource.memory}MB</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Server className="w-4 h-4 text-purple-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Replicas</span>
                  <span className="text-sm font-medium">{resource.replicas}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Ports Configuration */}
        {ports.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-600" />
                <h4 className="font-medium">Ports ({ports.length})</h4>
              </div>
              <div className="space-y-2">
                {ports.map((port, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-green-600" />
                        <span className="text-sm font-medium">{port.port}</span>
                        <Badge variant="outline" className="text-xs">
                          {port.protocol}
                        </Badge>
                        {port.appProtocol && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                            {port.appProtocol}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {port.exposesPublicDomain && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                            Public
                          </Badge>
                        )}
                        {port.publicAddress && (
                          <span className="text-xs text-muted-foreground">
                            {port.publicAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <Separator />
        <div className="flex gap-3 pt-2">
          <Button className="flex-1" variant="outline" size="sm" onClick={handleMonitorClick}>
            <Monitor className="w-4 h-4 mr-2" />
            Monitor
          </Button>
          <Button className="flex-1" variant="outline" size="sm" onClick={handleLogsClick}>
            <FileText className="w-4 h-4 mr-2" />
            Logs
          </Button>
          <Button className="flex-1" variant="outline" size="sm" onClick={handlePodClick}>
            <Container className="w-4 h-4 mr-2" />
            Pod
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchpadInfoMessageCard;
