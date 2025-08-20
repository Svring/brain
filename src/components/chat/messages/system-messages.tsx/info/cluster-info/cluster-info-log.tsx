"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { createK8sContext, createSealosContext } from "@/lib/auth/auth-utils";
import { getClusterLogsOptions } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  FileText,
  AlertCircle,
  Database,
  CheckCircle,
  Bot,
} from "lucide-react";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

interface ClusterInfoLogProps {
  payload: CustomResourceTarget;
}

export const ClusterInfoLog: React.FC<ClusterInfoLogProps> = ({ payload }) => {
  const k8sContext = createK8sContext();
  const sealosContext = createSealosContext();

  const sendMessageMutation = useSendMessageMutation();

  const {
    data: logsData,
    isLoading,
    error,
  } = useQuery(getClusterLogsOptions(k8sContext, sealosContext, payload));

  // Log the results as requested
  React.useEffect(() => {
    if (logsData) {
      console.log("Cluster logs result:", logsData);
    }
    if (error) {
      console.error("Cluster logs error:", error);
    }
  }, [logsData, error]);

  if (isLoading) {
    return (
      <Card className="w-full bg-node-background">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Database Logs: {payload.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs text-muted-foreground">Loading logs...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-node-background">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Database Logs: {payload.name}</span>
            </div>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs">Failed to load logs</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logsData || !logsData.supported) {
    return (
      <Card className="w-full bg-node-background">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Database Logs: {payload.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {(logsData && "message" in logsData && logsData.message) ||
                  "No logs available"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const logs = "data" in logsData ? logsData.data : {};
  const pods = Object.keys(logs || {});
  const totalLogEntries = Object.values(logs || {}).reduce(
    (total: number, podLogs: any) => {
      const podLogsData = podLogs?.logs || {};
      return total + Object.values(podLogsData).flat().length;
    },
    0
  );

  if (pods.length === 0) {
    return (
      <Card className="w-full bg-node-background">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Database Logs: {payload.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                No pods with logs available
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-node-background">
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* First row: Resource name */}
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">Database Logs: {payload.name}</span>
          </div>
          
          {/* Second row: Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">
                {totalLogEntries} entries across {pods.length} pods
              </span>
            </div>
            <Button
              size="sm"
              className="flex items-center gap-1"
              onClick={() => {
                sendMessageMutation.mutate([
                  {
                    role: "user",
                    content: `Analyze the logs and tell me what you found. Please provide a detailed analysis of the logs.
                      Here are the logs:
                      ${JSON.stringify(logs)}`,
                  },
                ]);
              }}
            >
              <Bot className="h-3 w-3" />
              Analyze
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClusterInfoLog;
