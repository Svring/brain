"use client";

import React from "react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, AlertCircle, CheckCircle, Bot } from "lucide-react";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import MessageHeader from "@/components/chat/messages/components/message-header";
import { useResourceLogs } from "@/hooks/sealos/resource/use-resource-logs";

interface LaunchpadInfoLogProps {
  payload: BuiltinResourceTarget;
}

export const LaunchpadInfoLog: React.FC<LaunchpadInfoLogProps> = ({
  payload,
}) => {
  const sendMessageMutation = useSendMessageMutation();

  const { data: logsData, isLoading, error } = useResourceLogs(payload);

  // Log the results as requested
  React.useEffect(() => {
    if (logsData) {
      console.log("Launchpad logs result:", logsData);
    }
    if (error) {
      console.error("Launchpad logs error:", error);
    }
  }, [logsData, error]);

  const handleAnalyze = () => {
    if (logsData) {
      sendMessageMutation.mutate([
        {
          role: "user",
          content: `Analyze the logs and tell me what you found. Please provide a detailed analysis of the logs.
            Here are the logs:
            ${JSON.stringify(logsData)}`,
        },
      ]);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-node-background">
        <CardHeader className="pb-3">
          <MessageHeader target={payload} />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs text-muted-foreground">
              Loading logs...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-node-background">
        <CardHeader className="pb-3">
          <MessageHeader target={payload} />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Failed to load logs</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logsData || (Array.isArray(logsData) && logsData.length === 0)) {
    return (
      <Card className="w-full bg-node-background">
        <CardHeader className="pb-3">
          <MessageHeader target={payload} />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              No logs available
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert logs to string and truncate to 3 lines
  const logsString = JSON.stringify(logsData, null, 2);
  const lines = logsString.split("\n");
  const truncatedLogs = lines.slice(0, 3).join("\n");
  const hasMoreLines = lines.length > 3;

  return (
    <Card className="w-full bg-node-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <MessageHeader target={payload} />
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
            onClick={handleAnalyze}
          >
            <Bot className="h-3 w-3" />
            Analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Status */}
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">
              {Array.isArray(logsData) ? logsData.length : 0} log entries
              available
            </span>
          </div>

          {/* Logs display */}
          <div className="bg-muted/50 rounded-md p-2">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
              {truncatedLogs}
              {hasMoreLines && (
                <span className="text-muted-foreground/60">
                  {"\n"}... (truncated)
                </span>
              )}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchpadInfoLog;
