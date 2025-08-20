"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { createK8sContext, createSealosContext } from "@/lib/auth/auth-utils";
import { getLaunchpadLogsOptions } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, AlertCircle, CheckCircle, Bot } from "lucide-react";

interface LaunchpadInfoLogProps {
  payload: BuiltinResourceTarget;
}

export const LaunchpadInfoLog: React.FC<LaunchpadInfoLogProps> = ({
  payload,
}) => {
  const k8sContext = createK8sContext();
  const sealosContext = createSealosContext();

  const {
    data: logs,
    isLoading,
    error,
  } = useQuery(getLaunchpadLogsOptions(k8sContext, sealosContext, payload));

  // Log the results as requested
  React.useEffect(() => {
    if (logs) {
      console.log("Launchpad logs result:", logs);
    }
    if (error) {
      console.error("Launchpad logs error:", error);
    }
  }, [logs, error]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            Application Logs
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
            <FileText className="h-4 w-4" />
            Application Logs
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

  if (!logs || logs.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            Application Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-muted-foreground">No logs available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          Application Logs
          <Badge variant="secondary" className="text-xs">
            {logs.length} entries
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
                {logs.length} log entries are ready for analysis
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

export default LaunchpadInfoLog;
