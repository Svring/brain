import React, { useState } from "react";
import {
  ClusterObject,
  ClusterObjectSchema,
} from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/contexts/auth/auth-context";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import {
  composeClusterPublicConnectionString,
  composeClusterPrivateConnectionString,
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import { Separator } from "@/components/ui/separator";
import { ClusterResourceConfiguration } from "./cluster-resource-configuration";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clusterResourceSchema } from "./cluster-resource-configuration";
import { Button } from "@/components/ui/button";
import { Check, Cpu, MemoryStick, HardDrive, Layers, PenLine, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface ClusterMessageDetailsProps {
  target: CustomResourceTarget;
}

const ClusterMessageDetails: React.FC<ClusterMessageDetailsProps> = ({
  target,
}) => {
  const { auth } = useAuthState();
  const [isResourceEditing, setIsResourceEditing] = useState(false);

  const { resource, isLoading, error } = useResourceStatus(target);

  // Parse the resource data
  const clusterObject = resource ? ClusterObjectSchema.parse(resource) : null;

  // Initialize form with cluster resource data
  const resourceData = Array.isArray(clusterObject?.resource) || !clusterObject?.resource 
    ? null 
    : clusterObject.resource;

  const form = useForm({
    resolver: zodResolver(clusterResourceSchema),
    defaultValues: {
      cpu: resourceData?.cpu?.toString() || "2",
      memory: resourceData?.memory?.toString() || "4",
      storage: resourceData?.storage?.toString() || "20",
      replicas: resourceData?.replicas?.toString() || "1",
    },
  });

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ");
  };

  const formatValue = (value: any, type: "cpu" | "memory" | "storage" | "replicas") => {
    if (!value) return "N/A";
    if (type === "cpu") return `${value}Core`;
    if (type === "memory") return `${value}GB`;
    if (type === "storage") return `${value}GB`;
    if (type === "replicas") return value.toString();
    return value;
  };

  const handleResourceSubmit = async (data: any) => {
    // TODO: Implement save functionality
    console.log("Saving cluster resource configuration:", data);
    setIsResourceEditing(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Loading cluster information...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !clusterObject) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-red-600 font-medium">
            Failed to load cluster information
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Version and Created At Info */}
      <div className="flex flex-row gap-4">
        {/* Version Info */}
        {clusterObject.version && (
          <div className="flex flex-col space-y-1 flex-1">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-medium truncate">
              {clusterObject.version}
            </span>
          </div>
        )}

        {/* Created At Info */}
        {clusterObject.operationalStatus?.createdAt && (
          <div className="flex flex-col space-y-1 flex-1">
            <span className="text-sm text-muted-foreground">Created At</span>
            <span className="text-sm font-medium truncate">
              {clusterObject.operationalStatus.createdAt}
            </span>
          </div>
        )}
      </div>

      {/* Resource Configuration Section */}
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
                  {formatValue(resourceData?.cpu, "cpu")}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Memory</div>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {formatValue(resourceData?.memory, "memory")}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Storage</div>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {formatValue(resourceData?.storage, "storage")}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Replicas</div>
                <Layers className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {formatValue(resourceData?.replicas, "replicas")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClusterMessageDetails;
