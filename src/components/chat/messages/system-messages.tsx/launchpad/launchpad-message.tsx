import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { FileText, Container, BarChart3, Pencil, Globe } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import LaunchpadMessageDetails from "./components/launchpad-message-details";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import LaunchpadMessageMenu from "./components/launchpad-message-menu";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";

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
    data: launchpadObjectData,
    isLoading,
    error,
  } = useQuery(launchpad.get.queryOptions(target));

  // Remove the update image action since it's now handled inline
  const actions: MessageAction[] = launchpadObjectData
    ? [
        {
          icon: Globe,
          label: "Network Status",
          onClick: () => {
            appendSystemMessage({ type: "launchpad.network", target });
          },
        },
      ]
    : [];

  // Show loading state
  if (isLoading) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading launchpad information...
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  const launchpadObject = LaunchpadObjectSchema.parse(launchpadObjectData);

  // Show error state
  if (error || !launchpadObject) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load launchpad information
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  return (
    <BaseResourceMessage
      target={target}
      actions={actions}
      headerSlot={<LaunchpadMessageMenu target={target} />}
    >
      <LaunchpadMessageDetails target={target} />
    </BaseResourceMessage>
  );
};

export default LaunchpadInfoMessageCard;
