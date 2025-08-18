import React from "react";
import { Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="w-full bg-background-secondary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Box className={`h-5 w-5 ${getStatusColor()}`} />
          Pod Overview ({totalPods} total)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {podList && podList.length > 0 ? (
          <>
            {/* Summary */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Running: {runningPods}/{totalPods}
              </div>
              <div className="text-sm text-muted-foreground">
                {((runningPods / totalPods) * 100).toFixed(0)}% healthy
              </div>
            </div>

            {/* Pod List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Pod Status</h4>
              <div className="grid gap-2">
                {podList.map((pod, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-background space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate max-w-48">
                          {pod.name}
                        </span>
                      </div>
                      <Badge variant={getStatusVariant(pod.status)}>
                        {pod.status}
                      </Badge>
                    </div>

                    {/* Container Details */}
                    {pod.containers && pod.containers.length > 0 && (
                      <div className="space-y-1">
                        {pod.containers.map((container, containerIndex) => (
                          <div
                            key={containerIndex}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  container.ready
                                    ? "bg-theme-green"
                                    : "bg-theme-red"
                                }`}
                              />
                              <span className="text-muted-foreground">
                                {container.name}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              {container.state.running ? (
                                <span className="text-theme-green">
                                  Running
                                </span>
                              ) : container.state.waiting ? (
                                <span className="text-theme-yellow">
                                  {container.state.waiting.reason}
                                </span>
                              ) : container.state.terminated ? (
                                <span className="text-theme-red">
                                  {container.state.terminated.reason}
                                </span>
                              ) : (
                                <span>Unknown</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Status Summary */}
            <div className="flex gap-1">
              {podList.slice(0, 10).map((pod, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full ${
                    pod.status.toLowerCase() === "running"
                      ? "bg-theme-green"
                      : pod.status.toLowerCase() === "error"
                      ? "bg-theme-red"
                      : pod.status.toLowerCase() === "pending"
                      ? "bg-theme-gray"
                      : "bg-theme-yellow"
                  }`}
                  title={`${pod.name}: ${pod.status}`}
                />
              ))}
              {podList.length > 10 && (
                <div className="flex flex-col items-center gap-1">
                  <div className="h-2 w-8 rounded-full bg-muted" />
                  <div className="text-xs text-muted-foreground">
                    +{podList.length - 10}
                  </div>
                </div>
              )}
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
