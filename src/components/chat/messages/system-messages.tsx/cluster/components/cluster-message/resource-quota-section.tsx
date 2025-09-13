"use client";

import React from "react";
import { Cpu, MemoryStick, HardDrive, Layers } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { ClusterObjectSchema } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { ClusterResourceConfiguration } from "../cluster-resource-configuration";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clusterResourceSchema } from "../cluster-resource-configuration";
import { Button } from "@/components/ui/button";
import { Check, PenLine, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

interface ResourceQuotaSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// Resource Quota Popover Content Component
export const ResourceQuotaPopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  const [isResourceEditing, setIsResourceEditing] = useState(false);
  const { resource: clusterResource, isLoading } = useResourceStatus(target);
  
  const parsedClusterObject = clusterResource
    ? ClusterObjectSchema.parse(clusterResource)
    : null;

  // Initialize form with cluster resource data
  const resourceData = Array.isArray(parsedClusterObject?.resource) || !parsedClusterObject?.resource 
    ? null 
    : parsedClusterObject.resource;

  const form = useForm({
    resolver: zodResolver(clusterResourceSchema),
    defaultValues: {
      cpu: resourceData?.cpu?.toString() || "2",
      memory: resourceData?.memory?.toString() || "4",
      storage: resourceData?.storage?.toString() || "20",
      replicas: resourceData?.replicas?.toString() || "1",
    },
  });

  const handleResourceSubmit = async (data: any) => {
    // TODO: Implement save functionality
    console.log("Saving cluster resource configuration:", data);
    setIsResourceEditing(false);
  };

  return (
    <div className="w-full rounded-lg">
      <div className="border border-dashed rounded-lg">
        <div className="flex items-center justify-between p-2 border-b border-dashed">
          <h3 className="font-medium">Resource Configuration</h3>
          {isResourceEditing ? (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8"
                onClick={() => setIsResourceEditing(false)}
                disabled={isLoading}
              >
                <X />
              </Button>
              <Button
                type="submit"
                form="cluster-resource-form"
                variant="outline"
                size="sm"
                className="h-8 w-8"
                onClick={() => form.handleSubmit(handleResourceSubmit)()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner variant="bars" className="h-4 w-4" />
                ) : (
                  <Check />
                )}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8"
              onClick={() => setIsResourceEditing(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner variant="bars" className="h-4 w-4" />
              ) : (
                <PenLine />
              )}
            </Button>
          )}
        </div>
        <div className={`${isResourceEditing ? "p-4" : "p-2"}`}>
          {isResourceEditing ? (
            <FormProvider {...form}>
              <form id="cluster-resource-form" onSubmit={form.handleSubmit(handleResourceSubmit)}>
                <ClusterResourceConfiguration form={form} />
              </form>
            </FormProvider>
          ) : (
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">CPU</div>
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {resourceData?.cpu ? `${resourceData.cpu}Core` : "N/A"}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Memory</div>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {resourceData?.memory ? `${resourceData.memory}GB` : "N/A"}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Storage</div>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {resourceData?.storage ? `${resourceData.storage}GB` : "N/A"}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Replicas</div>
                <Layers className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {resourceData?.replicas ? resourceData.replicas.toString() : "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>
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

  const resourceData = Array.isArray(parsedClusterObject?.resource) || !parsedClusterObject?.resource 
    ? null 
    : parsedClusterObject.resource;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex gap-2">
        {/* CPU */}
        <div className="flex-1 flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">CPU</span>
            <span className="text-xs text-muted-foreground">
              {resourceData?.cpu ? `${resourceData.cpu}Core` : "N/A"}
            </span>
          </div>
        </div>

        {/* Memory */}
        <div className="flex-1 flex items-center gap-2">
          <MemoryStick className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Memory</span>
            <span className="text-xs text-muted-foreground">
              {resourceData?.memory ? `${resourceData.memory}GB` : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceQuotaSection;
