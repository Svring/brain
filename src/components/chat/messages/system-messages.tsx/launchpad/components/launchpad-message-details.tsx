import React, { useState } from "react";
import {
  ChevronDown,
  Terminal,
  Database,
  Settings,
  Edit3,
  Cpu,
  MemoryStick,
  PenLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EnvTable } from "../../components/env-table";
import {
  LaunchpadObject,
  LaunchpadObjectSchema,
} from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";

interface LaunchpadMessageDetailsProps {
  target: BuiltinResourceTarget;
}

export const LaunchpadMessageDetails: React.FC<
  LaunchpadMessageDetailsProps
> = ({ target }) => {
  const { resource, isLoading, error } = useResourceStatus(target);
  const queryClient = useQueryClient();
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageValue, setImageValue] = useState("");
  const [isResourceEditing, setIsResourceEditing] = useState(false);
  const [isReplicasEditing, setIsReplicasEditing] = useState(false);
  const [isConfigEditing, setIsConfigEditing] = useState(false);

  const { launchpad } = useTRPCClients();
  const updateLaunchpad = useMutation(
    launchpad.updateLaunchpad.mutationOptions()
  );

  // Parse the resource data
  const launchpadObject = resource
    ? LaunchpadObjectSchema.parse(resource)
    : null;
  const { image, operationalStatus, env, command, args } =
    launchpadObject || {};

  const formatEnvVars = (envVars: any) => {
    if (!envVars || !Array.isArray(envVars)) return [];
    return envVars.map((envVar: any) => ({
      type: "value" as const,
      name: envVar.name || envVar.key,
      value: envVar.value || envVar.val,
    }));
  };

  const envVars = formatEnvVars(env);

  const handleImageEdit = () => {
    setIsEditingImage(true);
    setImageValue(image || "");
  };

  const handleImageCancel = () => {
    setIsEditingImage(false);
    setImageValue("");
  };

  const handleImageSubmit = async () => {
    if (!imageValue.trim()) return;

    try {
      const updateRequest = {
        name: target.name!,
        request: {
          image: imageValue.trim(),
        },
      };

      console.log("updateRequest", updateRequest);

      await updateLaunchpad.mutateAsync(updateRequest, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.getLaunchpad.queryKey(target),
          });
          toast.success("Image updated successfully!");
          setIsEditingImage(false);
          setImageValue("");
        },
        onError: () => {
          toast.error("Failed to update image");
        },
      });
    } catch (error) {
      console.error("Failed to update launchpad image:", error);
      toast.error("Failed to update image");
    }
  };

  const handleResourceSubmit = async (data: LaunchpadUpdateFormData) => {
    try {
      // Only send fields that have values
      const requestData: any = {};
      if (data.resource) {
        requestData.resource = {
          cpu: data.resource.cpu,
          memory: data.resource.memory,
        };
      }

      const updateRequest = {
        name: target.name!,
        request: requestData,
      };

      await updateLaunchpad.mutateAsync(updateRequest, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.getLaunchpad.queryKey(target),
          });
          toast.success("Resource configuration updated successfully!");
          setIsResourceEditing(false);
        },
        onError: () => {
          toast.error("Failed to update resource configuration");
        },
      });
    } catch (error) {
      console.error("Failed to update launchpad resources:", error);
      toast.error("Failed to update resource configuration");
    }
  };

  const handleReplicasSubmit = async (data: LaunchpadUpdateFormData) => {
    try {
      if (!data.resource?.replicas) return;

      const updateRequest = {
        name: target.name!,
        request: {
          resource: {
            replicas: data.resource.replicas,
          },
        },
      };

      await updateLaunchpad.mutateAsync(updateRequest, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.getLaunchpad.queryKey(target),
          });
          toast.success("Replicas updated successfully!");
          setIsReplicasEditing(false);
        },
        onError: () => {
          toast.error("Failed to update replicas");
        },
      });
    } catch (error) {
      console.error("Failed to update launchpad replicas:", error);
      toast.error("Failed to update replicas");
    }
  };

  const handleConfigSubmit = async (data: LaunchpadUpdateFormData) => {
    try {
      // Only send fields that have values
      const requestData: any = {};
      if (data.command !== undefined) requestData.command = data.command;
      if (data.args !== undefined) requestData.args = data.args;
      if (data.env !== undefined) requestData.env = data.env;

      const updateRequest = {
        name: target.name!,
        request: requestData,
      };

      await updateLaunchpad.mutateAsync(updateRequest, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.getLaunchpad.queryKey(target),
          });
          toast.success("Configuration updated successfully!");
          setIsConfigEditing(false);
        },
        onError: () => {
          toast.error("Failed to update configuration");
        },
      });
    } catch (error) {
      console.error("Failed to update launchpad configuration:", error);
      toast.error("Failed to update configuration");
    }
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
      {/* Image Info */}
      {image && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Image</span>
          {isEditingImage ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={imageValue}
                onChange={(e) => setImageValue(e.target.value)}
                placeholder="Enter image URL (e.g., nginx:latest)"
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleImageSubmit();
                  } else if (e.key === "Escape") {
                    handleImageCancel();
                  }
                }}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleImageSubmit}
                disabled={updateLaunchpad.isPending || !imageValue.trim()}
                className="h-8 w-8 p-0"
              >
                {updateLaunchpad.isPending ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleImageCancel}
                disabled={updateLaunchpad.isPending}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div
              className="group flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-2 py-1 transition-colors flex-1"
              onClick={handleImageEdit}
              title="Click to edit image"
            >
              <span className="font-medium truncate flex-1">{image}</span>
              <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      )}

      {/* Created At Info */}
      {operationalStatus && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Created At</span>
          <span className="text-sm font-medium truncate">
            {operationalStatus.createdAt}
          </span>
        </div>
      )}

      {/* Resource Quota Section */}
      <div className="border border-dashed rounded-lg">
        <div className="flex items-center justify-between p-2 border-b border-dashed">
          <h3 className="font-medium">Quota</h3>
          {isResourceEditing ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-1"
                onClick={() => setIsResourceEditing(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="h-6 w-6 p-1"
              onClick={() => setIsResourceEditing(true)}
            >
              <PenLine className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="p-2">
          {isResourceEditing ? (
            <LaunchpadUpdateForm
              defaultValues={{
                resource: {
                  cpu: launchpadObject?.resource?.cpu || 0.1,
                  memory: launchpadObject?.resource?.memory || 0.5,
                },
              }}
              onSubmit={handleResourceSubmit}
              isLoading={updateLaunchpad.isPending}
            />
          ) : (
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">CPU</div>
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {launchpadObject.resource?.cpu
                    ? `${launchpadObject.resource.cpu}Core`
                    : "N/A"}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Memory</div>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {launchpadObject.resource?.memory
                    ? `${launchpadObject.resource.memory}GB`
                    : "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deployment Section */}
      <div className="border border-dashed rounded-lg">
        <div className="flex items-center justify-between p-2 border-b border-dashed">
          <h3 className="font-medium">Deployment</h3>
          {isReplicasEditing ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-1"
                onClick={() => setIsReplicasEditing(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="h-6 w-6 p-1"
              onClick={() => setIsReplicasEditing(true)}
            >
              <PenLine className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="p-2">
          {isReplicasEditing ? (
            <LaunchpadUpdateForm
              defaultValues={{
                resource: {
                  replicas: launchpadObject?.resource?.replicas || 1,
                },
              }}
              onSubmit={handleReplicasSubmit}
              isLoading={updateLaunchpad.isPending}
            />
          ) : (
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Mode</div>
                <div className="text-sm font-medium">Fixed</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-muted-foreground">Replicas</div>
                <div className="text-sm font-medium">
                  {launchpadObject.resource?.replicas || "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Summary Section */}
      <div className="border border-dashed rounded-lg">
        <div className="flex items-center justify-between p-2 border-b border-dashed">
          <h3 className="font-medium">Configuration</h3>
          {isConfigEditing ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-1"
                onClick={() => setIsConfigEditing(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="h-6 w-6 p-1"
              onClick={() => setIsConfigEditing(true)}
            >
              <PenLine className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="p-2">
          {isConfigEditing ? (
            <LaunchpadUpdateForm
              defaultValues={{
                command: command || "",
                args: args || "",
                env: envVars || [],
              }}
              onSubmit={handleConfigSubmit}
              isLoading={updateLaunchpad.isPending}
            />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Command</span>
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {command || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Arguments</span>
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {args || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Env Variables
                </span>
                <span className="text-sm font-medium">
                  {envVars.length > 0 ? `${envVars.length} variables` : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Config Map
                </span>
                <span className="text-sm font-medium">
                  {(launchpadObject as any).configMap &&
                  (launchpadObject as any).configMap.length > 0
                    ? `${(launchpadObject as any).configMap.length} items`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Volumes</span>
                <span className="text-sm font-medium">
                  {(launchpadObject as any).storage &&
                  (launchpadObject as any).storage.length > 0
                    ? `${(launchpadObject as any).storage.length} volumes`
                    : "N/A"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaunchpadMessageDetails;
