import React from "react";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ImageCreatedAt } from "./launchpad-message-detail/image-created-at";
import { ResourceQuota } from "./launchpad-message-detail/resource-quota";
import { Deployment } from "./launchpad-message-detail/deployment";
import { Configuration } from "./launchpad-message-detail/configuration";

interface LaunchpadMessageDetailsProps {
  target: BuiltinResourceTarget;
}

export const LaunchpadMessageDetails: React.FC<
  LaunchpadMessageDetailsProps
> = ({ target }) => {
  const { resource, isLoading, error } = useResourceStatus(target);
  const queryClient = useQueryClient();
  const { launchpad } = useTRPCClients();

  console.log("resource", resource);

  const updateLaunchpad = useMutation(
    launchpad.updateLaunchpad.mutationOptions()
  );

  // Parse the resource data
  const launchpadObject = resource
    ? LaunchpadObjectSchema.parse(resource)
    : null;
  const { image, operationalStatus, env, launchCommand } =
    launchpadObject || {};

  // Keep the original env for display, format only when editing
  const handleSubmit = async (type: string, data?: any) => {
    console.log("data", data);
    // try {
    //   let requestData: any = {};

    //   switch (type) {
    //     case "image":
    //       requestData = { image: data };
    //       break;
    //     case "resource":
    //       if (data?.resource) {
    //         requestData = {
    //           resource: {
    //             cpu: data.resource.cpu,
    //             memory: data.resource.memory,
    //           },
    //         };
    //       }
    //       break;
    //     case "replicas":
    //       if (data?.resource?.replicas) {
    //         requestData = { resource: { replicas: data.resource.replicas } };
    //       }
    //       break;
    //     case "config":
    //       if (data?.command !== undefined) requestData.command = data.command;
    //       if (data?.args !== undefined) requestData.args = data.args;
    //       if (data?.env !== undefined) requestData.env = data.env;
    //       break;
    //   }

    //   const updateRequest = { name: target.name!, request: requestData };

    //   await updateLaunchpad.mutateAsync(updateRequest, {
    //     onSuccess: () => {
    //       queryClient.invalidateQueries({
    //         queryKey: launchpad.getLaunchpad.queryKey(target),
    //       });

    //       const messages = {
    //         image: "Image updated successfully!",
    //         resource: "Resource configuration updated successfully!",
    //         replicas: "Replicas updated successfully!",
    //         config: "Configuration updated successfully!",
    //       };

    //       toast.success(messages[type as keyof typeof messages]);
    //     },
    //     onError: () => {
    //       const messages = {
    //         image: "Failed to update image",
    //         resource: "Failed to update resource configuration",
    //         replicas: "Failed to update replicas",
    //         config: "Failed to update configuration",
    //       };
    //       toast.error(messages[type as keyof typeof messages]);
    //     },
    //   });
    // } catch (error) {
    //   console.error(`Failed to update launchpad ${type}:`, error);
    //   toast.error(`Failed to update ${type}`);
    // }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Loading launchpad information...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !launchpadObject) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-red-600 font-medium">
            Failed to load launchpad information
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ImageCreatedAt
        target={target}
        image={image}
        createdAt={operationalStatus?.createdAt}
        onImageUpdate={handleSubmit}
      />

      <ResourceQuota
        resource={launchpadObject?.resource}
        onResourceUpdate={handleSubmit}
        isLoading={false}
      />

      <Deployment
        resource={launchpadObject?.resource}
        strategy={launchpadObject?.strategy}
        onDeploymentUpdate={handleSubmit}
        isLoading={false}
      />

      <Configuration
        command={launchCommand?.command}
        args={launchCommand?.args}
        envVars={env}
        configMap={(launchpadObject as any)?.configMap}
        storage={(launchpadObject as any)?.storage}
        onConfigUpdate={handleSubmit}
        isLoading={false}
      />
    </div>
  );
};

export default LaunchpadMessageDetails;
