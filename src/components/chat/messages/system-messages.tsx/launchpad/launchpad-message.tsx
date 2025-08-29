import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { BaseSystemMessage } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { FileText, Container, BarChart3, Pencil } from "lucide-react";
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
  } = useQuery(launchpad.getLaunchpad.queryOptions(target));

  const launchpadObject = LaunchpadObjectSchema.parse(launchpadObjectData);

  // Remove the update image action since it's now handled inline
  const actions: MessageAction[] = [];

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
    <BaseSystemMessage
      target={target}
      actions={actions}
      headerSlot={<LaunchpadMessageMenu target={target} />}
    >
      <LaunchpadMessageDetails target={target} />
    </BaseSystemMessage>
  );
};

export default LaunchpadInfoMessageCard;
