"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { createK8sContext, createSealosContext } from "@/lib/auth/auth-utils";
import { getClusterLogsOptions } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, AlertCircle, Database, CheckCircle, Bot } from "lucide-react";

interface ClusterInfoLogProps {
  payload: CustomResourceTarget;
}

export const ClusterInfoLog: React.FC<ClusterInfoLogProps> = ({
  payload,
}) => {
  const k8sContext = createK8sContext();
  const sealosContext = createSealosContext();

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
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Database Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Database Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Failed to load logs</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logsData || !logsData.supported) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Database Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-muted-foreground">
              {logsData && 'message' in logsData && logsData.message || "No logs available"}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const logs = 'data' in logsData ? logsData.data : {};
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
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Database Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-muted-foreground">No pods with logs available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          Database Logs
          <Badge variant="secondary" className="text-xs">
            {totalLogEntries} entries across {pods.length} pods
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Logs Successfully Fetched</p>
              <p className="text-xs text-muted-foreground">
                {totalLogEntries} log entries across {pods.length} pods are ready for analysis
              </p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4">
          <Button size="sm" className="flex items-center gap-2">
            <Bot className="h-3 w-3" />
            Analyze with AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};



export default ClusterInfoLog;
