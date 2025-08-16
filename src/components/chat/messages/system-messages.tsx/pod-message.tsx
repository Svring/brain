import React from "react";
import { Box, Activity, Clock, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Pod {
  name: string;
  status: string;
  age?: string;
  nodeName?: string;
  ip?: string;
  restarts?: number;
  cpu?: number;
  memory?: number;
}

interface PodMessageProps {
  payload: {
    pods?: Pod[];
    resourceName?: string;
    resourceType?: string;
  };
}

export const PodMessageCard: React.FC<PodMessageProps> = ({
  payload,
}) => {
  const { pods = [], resourceName = "Unknown Resource", resourceType = "Unknown" } = payload;

  const getPodStatusVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "running":
        return "default";
      case "stopped":
      case "shutdown":
        return "outline";
      case "pending":
      case "waiting":
        return "secondary";
      case "error":
      case "failed":
        return "destructive";
      case "deleting":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getOverallStatusColor = () => {
    if (pods.length === 0) {
      return "text-muted-foreground";
    }

    const hasError = pods.some((pod) => pod.status.toLowerCase() === "error" || pod.status.toLowerCase() === "failed");
    if (hasError) {
      return "text-red-500";
    }

    const allRunning = pods.every((pod) => pod.status.toLowerCase() === "running");
    if (allRunning) {
      return "text-green-500";
    }

    return "text-yellow-500";
  };

  const formatAge = (age?: string) => {
    if (!age) return "Unknown";
    // Convert age string to human readable format
    return age;
  };

  const formatResource = (value?: number) => {
    if (value === undefined || value === null) return "N/A";
    return value.toString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-black rounded-full"></div>
          <div className="flex-1">
            <CardTitle className="text-lg">Pods for {resourceName}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Server className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{resourceType}</span>
            </div>
          </div>
          <Badge variant="outline">
            {pods.length} pod{pods.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center gap-2">
          <Box className={`h-4 w-4 ${getOverallStatusColor()}`} />
          <span className="text-sm text-muted-foreground">
            Overall Status: {
              pods.length === 0 ? "No pods" :
              pods.every(pod => pod.status.toLowerCase() === "running") ? "All Running" :
              pods.some(pod => pod.status.toLowerCase() === "error" || pod.status.toLowerCase() === "failed") ? "Has Errors" :
              "Mixed Status"
            }
          </span>
        </div>

        {/* Pods List */}
        {pods.length > 0 ? (
          <div className="space-y-3">
            {pods.map((pod, index) => (
              <Card key={pod.name || index} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      {pod.name}
                    </span>
                  </div>
                  <Badge variant={getPodStatusVariant(pod.status)}>
                    {pod.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div className="space-y-1">
                    {pod.age && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Age: {formatAge(pod.age)}</span>
                      </div>
                    )}
                    {pod.nodeName && (
                      <div className="flex items-center gap-1">
                        <Server className="h-3 w-3" />
                        <span>Node: {pod.nodeName}</span>
                      </div>
                    )}
                    {pod.ip && (
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>IP: {pod.ip}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {pod.restarts !== undefined && (
                      <div>
                        <span className="font-medium">Restarts:</span> {pod.restarts}
                      </div>
                    )}
                    {pod.cpu !== undefined && (
                      <div>
                        <span className="font-medium">CPU:</span> {formatResource(pod.cpu)}m
                      </div>
                    )}
                    {pod.memory !== undefined && (
                      <div>
                        <span className="font-medium">Memory:</span> {formatResource(pod.memory)}Mi
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Box className="h-8 w-8 text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground">No pods available</div>
            <div className="text-xs text-muted-foreground mt-1">Pods will appear here when the resource is running</div>
          </div>
        )}

        {/* Status Legend */}
        <Separator />
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Status Legend</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Running</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Pending/Waiting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Error/Failed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>Stopped</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PodMessageCard;
