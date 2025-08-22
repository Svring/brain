import React from "react";
import { Box, Container } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Pod } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { BaseSystemMessage } from "@/components/chat/messages/components/base-system-message";
import { MessageAction } from "@/components/chat/messages/components/message-actions";

interface PodOverviewProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const PodOverview: React.FC<PodOverviewProps> = ({ target }) => {
  const { resource, isLoading, error } = useResourceStatus(target);
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  // Extract pods from resource based on resource type
  const getPodList = (): Pod[] => {
    if (!resource) return [];

    // Handle different resource types
    if ("pods" in resource && resource.pods) {
      return resource.pods as Pod[];
    }

    // For resources that don't have pods, return empty array
    return [];
  };

  const podList = getPodList();

  const actions: MessageAction[] =
    podList.length > 0
      ? [
          {
            icon: Container,
            label: "View Pod Details",
            onClick: () => appendSystemMessage("manage.podDetails", target),
          },
        ]
      : [];

  const runningPods = podList.filter(
    (pod: Pod) => pod.status.toLowerCase() === "running"
  ).length;
  const totalPods = podList.length;
  const runningPercentage = totalPods > 0 ? (runningPods / totalPods) * 100 : 0;

  // Handle loading state
  if (isLoading) {
    return (
      <BaseSystemMessage target={target}>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Loading pods...</p>
        </div>
      </BaseSystemMessage>
    );
  }

  // Handle error state
  if (error) {
    return (
      <BaseSystemMessage target={target}>
        <div className="text-center py-4">
          <p className="text-sm text-theme-red">Failed to load pods</p>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage target={target} actions={actions}>
      {podList && podList.length > 0 ? (
        <>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Running Pods</span>
              <span className="font-medium">
                {runningPods} / {totalPods}
              </span>
            </div>
            <Progress
              value={runningPercentage}
              className="h-2 [&>div]:bg-theme-green"
            />
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <Box className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No pods available</p>
        </div>
      )}
    </BaseSystemMessage>
  );
};

export default PodOverview;
