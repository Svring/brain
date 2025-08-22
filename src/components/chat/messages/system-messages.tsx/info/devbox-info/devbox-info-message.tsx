import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Card, CardContent } from "@/components/ui/card";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { getDevboxRangedMonitorOptions } from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import { useQuery } from "@tanstack/react-query";
import { createMetricsContext } from "@/lib/auth/auth-utils";
import { devboxClient } from "@/components/provider/trpc-provider";
import { DevboxInfoHeader } from "./devbox-info-header";
import { ResourceQuotaRow } from "@/components/chat/messages/components/resource-quota-row";
import { DevboxInfoPorts } from "./devbox-info-ports";
import { BaseSystemMessage } from "@/components/chat/messages/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/components/message-actions";
import { GitBranch, BarChart3, Container, FileText } from "lucide-react";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { DevboxInfoDetails } from "./devbox-info-details";

interface DevboxInfoMessageProps {
  payload: CustomResourceTarget;
}

export const DevboxInfoMessageCard: React.FC<DevboxInfoMessageProps> = ({
  payload,
}) => {
  const context = createK8sContext();
  const metricsContext = createMetricsContext();
  const { sendSystemMessage: emitMessage } = useSendSystemMessageMutation();

  const devboxTrpcClient = devboxClient.useTRPC();

  // Fetch devbox data using the target
  const {
    data: devboxData,
    isLoading,
    error,
  } = useQuery(
    devboxTrpcClient.getDevbox.queryOptions({
      target: payload,
    })
  );

  // Fetch devbox monitor data
  // const { data: monitorData } = useQuery(
  //   getDevboxRangedMonitorOptions(metricsContext, devboxData?.name || "")
  // );

  // Get region URL from the K8s context
  const regionUrl = context.regionUrl;

  const handleReleasesClick = () => {
    emitMessage({
      type: "info.devboxRelease",
      payload: {
        devboxName: devboxData?.name || "",
      },
    });
  };

  const handleViewMetricsClick = () => {
    emitMessage({
      type: "monitor",
      payload: payload,
    });
  };

  const handleViewPodsClick = () => {
    emitMessage({
      type: "podOverview",
      payload: payload,
    });
  };

  const handleViewLogsClick = () => {
    emitMessage({
      type: "resourceLog",
      payload: payload,
    });
  };

  const actions: MessageAction[] = devboxData
    ? [
        {
          icon: GitBranch,
          label: "Releases",
          onClick: handleReleasesClick,
        },
        {
          icon: BarChart3,
          label: "View Metrics",
          onClick: handleViewMetricsClick,
        },
        {
          icon: Container,
          label: "View Pods",
          onClick: handleViewPodsClick,
        },
        {
          icon: FileText,
          label: "View Logs",
          onClick: handleViewLogsClick,
        },
      ]
    : [];

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={payload}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading devbox information...
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !devboxData) {
    return (
      <BaseSystemMessage target={payload}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load devbox information
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage target={payload} actions={actions}>
      <DevboxInfoDetails devboxData={devboxData} />
      <DevboxInfoPorts devboxData={devboxData} />
    </BaseSystemMessage>
  );
};

export default DevboxInfoMessageCard;
