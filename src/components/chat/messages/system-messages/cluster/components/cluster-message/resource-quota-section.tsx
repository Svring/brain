"use client";

import React, { useState } from "react";
import { Cpu, MemoryStick, HardDrive, Layers } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { ClusterObjectSchema } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { Button } from "@/components/ui/button";
import { ClusterUpdateForm } from "@/components/forms/cluster/cluster-update-form";
import { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";
import { useClusterUpdate } from "@/hooks/sealos/cluster/use-cluster-update";
import { MonitorChart } from "../../../components/monitor-chart";

interface ResourceQuotaSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// Resource Quota Popover Content Component
export const ResourceQuotaPopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { resource: clusterObject } = useResourceStatus(target);

  const parsedClusterObject = clusterObject
    ? ClusterObjectSchema.parse(clusterObject)
    : null;

  // Get resource data from cluster object
  const resourceData =
    Array.isArray(parsedClusterObject?.resource) ||
    !parsedClusterObject?.resource
      ? null
      : parsedClusterObject.resource;

  // Update cluster using the custom hook
  const { updateCluster, isLoading: isUpdating } = useClusterUpdate({
    onSuccess: () => {
      setIsEditing(false);
    },
  });

  const handleFormSubmit = async (data: ClusterUpdateFormData) => {
    try {
      await updateCluster({
        name: parsedClusterObject?.name || target.name!,
        resource: data.resource,
      });
    } catch (error) {
      console.error("Error updating cluster resources:", error);
    }
  };

  // Helper function to create comparison display
  const createComparisonDisplay = (
    formValue: number,
    objectValue: number | undefined,
    unit: string
  ) => {
    if (objectValue !== undefined && objectValue !== formValue) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground line-through">
            {objectValue}
            {unit}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="font-medium">
            {formValue}
            {unit}
          </span>
        </div>
      );
    }
    return (
      <span className="font-medium">
        {formValue}
        {unit}
      </span>
    );
  };

  // Helper function to calculate total resources (per instance * replicas)
  const calculateTotalResources = (resourceData: any) => {
    if (!resourceData) return { cpu: 0, memory: 0, storage: 0 };

    const replicas = resourceData.replicas || 1;
    const cpu = parseFloat(resourceData.cpu?.toString() || "0");
    const memory = parseFloat(resourceData.memory?.toString() || "0");
    const storage = parseFloat(resourceData.storage?.toString() || "0");

    return {
      cpu: cpu * replicas,
      memory: memory * replicas,
      storage: storage * replicas,
    };
  };

  const totalResources = calculateTotalResources(resourceData);

  if (isEditing) {
    return (
      <div className="w-full rounded-lg space-y-3">
        <ClusterUpdateForm
          key={`resource-edit-${target.name}`}
          defaultValues={{
            name: parsedClusterObject?.name || target.name!,
            resource: {
              cpu: resourceData?.cpu,
              memory: resourceData?.memory,
              storage: resourceData?.storage!,
              replicas: resourceData?.replicas || 1,
            },
          }}
          onSubmit={handleFormSubmit}
          isLoading={isUpdating}
          hideDefaultButton={true}
        />

        {/* Cancel and Confirm Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsEditing(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="cluster-update-form"
            variant="default"
            size="sm"
            className="flex-1"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Confirm"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg space-y-3">
      {/* Resource Values Display */}
      <div className="flex items-center border p-2 rounded-lg justify-around">
        <div className="flex items-center gap-2">
          <Cpu className="h-6 w-6" />
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">CPU (Total)</div>
            <div className="text-sm font-medium">{totalResources.cpu} Core</div>
            <div className="text-xs text-muted-foreground">
              {resourceData?.cpu} × {resourceData?.replicas || 1}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MemoryStick className="h-6 w-6" />
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">Memory (Total)</div>
            <div className="text-sm font-medium">
              {totalResources.memory} GB
            </div>
            <div className="text-xs text-muted-foreground">
              {resourceData?.memory} × {resourceData?.replicas || 1}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive className="h-6 w-6" />
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">Storage (Total)</div>
            <div className="text-sm font-medium">
              {totalResources.storage} GB
            </div>
            <div className="text-xs text-muted-foreground">
              {resourceData?.storage} × {resourceData?.replicas || 1}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6" />
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">Replicas</div>
            <div className="text-sm font-medium">
              {resourceData?.replicas || 1}
            </div>
          </div>
        </div>
      </div>

      {/* Monitor Chart */}
      <MonitorChart target={target} />

      {/* Edit Button - Full Row */}
      <div className="w-full flex">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setIsEditing(true)}
        >
          Edit Resources
        </Button>
      </div>
    </div>
  );
};

export const ResourceQuotaSection: React.FC<ResourceQuotaSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { resource: clusterResource } = useResourceStatus(target);
  const parsedClusterObject = clusterResource
    ? ClusterObjectSchema.parse(clusterResource)
    : null;

  const resourceData =
    Array.isArray(parsedClusterObject?.resource) ||
    !parsedClusterObject?.resource
      ? null
      : parsedClusterObject.resource;

  // Helper function to calculate total resources
  const calculateTotalResources = (resourceData: any) => {
    if (!resourceData) return { cpu: 0, memory: 0, storage: 0 };

    const replicas = resourceData.replicas || 1;
    const cpu = parseFloat(resourceData.cpu?.toString() || "0");
    const memory = parseFloat(resourceData.memory?.toString() || "0");
    const storage = parseFloat(resourceData.storage?.toString() || "0");

    return {
      cpu: cpu * replicas,
      memory: memory * replicas,
      storage: storage * replicas,
    };
  };

  const totalResources = calculateTotalResources(resourceData);

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors w-full min-w-0"
      onClick={onSectionClick}
    >
      <div className="flex gap-2 min-w-0">
        {/* CPU */}
        <div className="flex-1 flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">CPU</span>
            <span className="text-xs font-mono font-semibold">
              {totalResources.cpu} Core
            </span>
          </div>
        </div>

        {/* Memory */}
        <div className="flex-1 flex items-center gap-2">
          <MemoryStick className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Memory</span>
            <span className="text-xs font-mono font-semibold">
              {totalResources.memory} GB
            </span>
          </div>
        </div>

        {/* Storage */}
        <div className="flex-1 flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Storage</span>
            <span className="text-xs font-mono font-semibold">
              {totalResources.storage} GB
            </span>
          </div>
        </div>

        {/* Replicas */}
        <div className="flex-1 flex items-center gap-2">
          <Layers className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Replicas</span>
            <span className="text-xs font-mono font-semibold">
              {resourceData?.replicas || 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceQuotaSection;
