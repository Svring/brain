import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { createMetricsContext } from "@/lib/auth/auth-utils";
import {
  getLaunchpadOptions,
  getLaunchpadRangedMonitorOptions,
} from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { LaunchpadInfoHeader } from "./launchpad-info-header";
import { LaunchpadInfoPorts } from "./launchpad-info-ports";
import { LaunchpadInfoLog } from "./launchpad-info-log";
import { BaseSystemMessage } from "@/components/chat/messages/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/components/message-actions";
import { FileText, Container, BarChart3 } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { LaunchpadInfoDetails } from "../../launchpad/components/launchpad-info-details";

interface LaunchpadInfoMessageProps {
  payload: BuiltinResourceTarget;
}

export const LaunchpadInfoMessageCard: React.FC<LaunchpadInfoMessageProps> = ({
  payload,
}) => {
  const k8sContext = createK8sContext();
  const metricsContext = createMetricsContext();
  const { sendSystemMessage: emitMessage } = useAppendSystemMessageMutation();

  // Fetch launchpad data using the target
  const {
    data: launchpadData,
    isLoading,
    error,
  } = useQuery(getLaunchpadOptions(k8sContext, payload));

  const handleLogsClick = () => {
    emitMessage({
      type: "resourceLog",
      payload: payload,
    });
  };

  const handlePodClick = () => {
    emitMessage({
      type: "podOverview",
      payload: payload,
    });
  };

  const handleViewMetricsClick = () => {
    emitMessage({
      type: "monitor",
      payload: payload,
    });
  };

  const actions: MessageAction[] = launchpadData
    ? [
        {
          icon: FileText,
          label: "Logs",
          onClick: handleLogsClick,
        },
        {
          icon: Container,
          label: "Pods",
          onClick: handlePodClick,
        },
        {
          icon: BarChart3,
          label: "Metrics",
          onClick: handleViewMetricsClick,
        },
      ]
    : [];

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={payload}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading launchpad information...
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !launchpadData) {
    return (
      <BaseSystemMessage target={payload}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load launchpad information
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  // Extract data from the fetched launchpad object
  const {
    name = "Unknown App",
    status,
    resource,
    ports = [],
    kind = "deployment",
    image = "",
  } = launchpadData;

  return (
    <BaseSystemMessage target={payload} actions={actions}>
      <LaunchpadInfoDetails launchpadData={launchpadData} />
      <div className="space-y-4">
        <LaunchpadInfoPorts ports={ports} />
        <LaunchpadInfoLog payload={payload} />
      </div>
    </BaseSystemMessage>
  );
};

export default LaunchpadInfoMessageCard;
