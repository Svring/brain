import React from "react";
import { Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { Pod } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { inferStatusColor } from "@/lib/sealos/sealos-utils";
import { useAppendMessagesMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useOnceEffect } from "@/hooks/use-once-effect";
import MessageHeader from "./message-header";
import { v4 as uuidv4 } from "uuid";

interface PodOverviewProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const PodOverview: React.FC<PodOverviewProps> = ({ target }) => {
  const { resource, isLoading, error } = useResourceStatus(target);
  const appendMessagesMutation = useAppendMessagesMutation();

  // Generate unique key for this component instance
  const componentKey = `${target.type}-${target.resourceType}-${target.name || 'overview'}-pods`;

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

  // Trigger pod details button when pods are available
  useOnceEffect(podList.length > 0 ? podList : null, (pods) => {
    appendMessagesMutation.mutate([
      {
        role: "system",
        content: {
          type: "manage.podDetailsButton",
          payload: target,
        },
      },
    ]);
  }, componentKey);

  // console.log("resource", resource);

  const getStatusColor = () => {
    if (podList.length === 0) {
      return "text-muted-foreground";
    }

    // Determine overall status based on pod states
    const hasError = podList.some(
      (pod: Pod) => pod.status.toLowerCase() === "error"
    );
    if (hasError) {
      return inferStatusColor("error", "text");
    }

    const allRunning = podList.every(
      (pod: Pod) => pod.status.toLowerCase() === "running"
    );
    if (allRunning) {
      return inferStatusColor("running", "text");
    }

    // For mixed states, use the first pod's status
    const firstPodStatus = podList[0]?.status.toLowerCase() || "unknown";
    return inferStatusColor(firstPodStatus, "text");
  };

  const runningPods = podList.filter(
    (pod: Pod) => pod.status.toLowerCase() === "running"
  ).length;
  const totalPods = podList.length;
  const runningPercentage = totalPods > 0 ? (runningPods / totalPods) * 100 : 0;

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="w-full bg-node-background">
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading pods...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="w-full bg-node-background">
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-theme-red">Failed to load pods</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-node-background">
      <CardHeader className="">
        <div className="space-y-4">
          <MessageHeader target={target} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
};

export default PodOverview;
