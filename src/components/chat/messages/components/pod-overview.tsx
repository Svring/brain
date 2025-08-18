import React from "react";
import { Box, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { inferStatusColor } from "@/lib/sealos/sealos-utils";

interface Container {
  name: string;
  ready: boolean;
  state: {
    running?: {
      startedAt: string;
    };
    waiting?: {
      reason: string;
    };
    terminated?: {
      reason: string;
      exitCode: number;
    };
  };
}

interface Pod {
  name: string;
  status: string;
  containers?: Container[];
}

interface PodOverviewProps {
  resource: {
    pods?: Pod[];
  };
}

export const PodOverview: React.FC<PodOverviewProps> = ({ resource }) => {
  // Extract pods from resource
  const podList = resource?.pods || [];
  const getStatusVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "running":
        return "default";
      case "stopped":
      case "shutdown":
        return "secondary";
      case "pending":
      case "waiting":
        return "outline";
      case "error":
        return "destructive";
      case "deleting":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = () => {
    if (podList.length === 0) {
      return "text-muted-foreground";
    }

    const hasError = podList.some(
      (pod) => pod.status.toLowerCase() === "error"
    );
    if (hasError) {
      return "text-theme-red";
    }

    const allRunning = podList.every(
      (pod) => pod.status.toLowerCase() === "running"
    );
    if (allRunning) {
      return "text-theme-green";
    }

    return "text-theme-gray";
  };

  const runningPods = podList.filter(
    (pod) => pod.status.toLowerCase() === "running"
  ).length;
  const totalPods = podList.length;

  return (
    <Card className="w-full bg-node-background">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-base">
          <Box className={`h-5 w-5 ${getStatusColor()}`} />
          Pod Overview ({totalPods} total)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {podList && podList.length > 0 ? (
          <>
            {/* Pod List */}
            <div className="space-y-2 border border-border-primary rounded-xl">
              <div className="grid gap-2">
                {podList.map((pod, index) => (
                  <div key={index} className="p-3 rounded-xl border space-y-2">
                    {/* Pod Name Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Pod: {pod.name}
                      </span>
                      {/* <Badge variant={getStatusVariant(pod.status)}>
                        {pod.status}
                      </Badge> */}
                    </div>

                    {/* Container Squares */}
                    {pod.containers && pod.containers.length > 0 && (
                      <div className="flex items-center gap-1">
                        {pod.containers.map((container, containerIndex) => {
                          // Determine container status for color
                          let containerStatus = "unknown";
                          if (container.state.running) {
                            containerStatus = "running";
                          } else if (container.state.waiting) {
                            containerStatus = "pending";
                          } else if (container.state.terminated) {
                            containerStatus = "error";
                          }

                          return (
                            <TooltipProvider key={containerIndex}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="group relative">
                                    <Square
                                      className={`h-4 w-4 fill-current ${inferStatusColor(
                                        containerStatus,
                                        "text"
                                      )}`}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="bg-background-secondary"
                                >
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      {container.name}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {containerStatus}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Box className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No pods available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PodOverview;
