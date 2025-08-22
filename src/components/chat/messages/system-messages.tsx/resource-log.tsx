"use client";

import React, { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useResourceLogs } from "@/hooks/sealos/resource/use-resource-logs";
import { BaseSystemMessage } from "@/components/chat/messages/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/components/message-actions";

interface ResourceLogProps {
  payload: CustomResourceTarget | BuiltinResourceTarget;
}

const ResourceLog: React.FC<ResourceLogProps> = ({ payload }) => {
  const { data: logsData } = useResourceLogs(payload);
  const sendMessageMutation = useSendMessageMutation();

  const handleAnalyze = useCallback(() => {
    if (logsData) {
      sendMessageMutation.mutate([
        {
          role: "user",
          content: `Analyze the logs and tell me what you found. Please provide a detailed analysis of the logs.
            Here are the logs:
            ${JSON.stringify(logsData, null, 2)}`,
        },
      ]);
    }
  }, [logsData, sendMessageMutation]);

  const logsString = logsData
    ? JSON.stringify(logsData, null, 2)
    : "No logs available";
  const lines = logsString.split("\n");
  const truncatedLogs = lines.slice(0, 3).join("\n");
  const hasMoreLines = lines.length > 3;

  const actions: MessageAction[] = [
    {
      icon: Bot,
      label: "Analyze",
      onClick: handleAnalyze,
    },
  ];

  return (
    <BaseSystemMessage target={payload} actions={actions}>
      <Card className="w-full bg-node-background">
        <CardContent className="pt-0">
          <div className="relative bg-muted/50 rounded-md p-2 max-h-24 overflow-hidden">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
              {truncatedLogs}
              {hasMoreLines && (
                <span className="text-muted-foreground/60">
                  {"\n"}... (truncated)
                </span>
              )}
            </pre>
          </div>
        </CardContent>
      </Card>
    </BaseSystemMessage>
  );
};

export default ResourceLog;
