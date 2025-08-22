import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/message-actions";
import { FileText, Container, BarChart3 } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import LaunchpadMessageDetails from "./components/launchpad-info-details";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

interface LaunchpadInfoMessageProps {
  target: BuiltinResourceTarget;
}

export const LaunchpadInfoMessageCard: React.FC<LaunchpadInfoMessageProps> = ({
  target,
}) => {
  const { launchpad } = useTRPCClients();
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  // Fetch launchpad data using the target
  const {
    data: launchpadObject,
    isLoading,
    error,
  } = useQuery(launchpad.getLaunchpad.queryOptions(target));

  const actions: MessageAction[] = launchpadObject
    ? [
        {
          icon: FileText,
          label: "Logs",
          onClick: () => {
            appendSystemMessage("resourceLog", target);
          },
        },
        {
          icon: Container,
          label: "Pods",
          onClick: () => {
            appendSystemMessage("podOverview", target);
          },
        },
        {
          icon: BarChart3,
          label: "Metrics",
          onClick: () => {
            appendSystemMessage("monitor", target);
          },
        },
      ]
    : [];

  // Show loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading launchpad information...
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  // Show error state
  if (error || !launchpadObject) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load launchpad information
          </span>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage target={target} actions={actions}>
      <LaunchpadMessageDetails launchpadObject={launchpadObject} />
    </BaseSystemMessage>
  );
};

export default LaunchpadInfoMessageCard;
