import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronDown,
  Terminal,
  Database,
  Settings,
  Check,
  X,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useForm, FormProvider } from "react-hook-form";
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import { ResourceConfiguration } from "./universal/resource-configuration";
import { REPLICAS_OPTIONS } from "@/lib/k8s/k8s-constant/k8s-constant-resource";
import { Slider } from "@/components/ui/slider";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResourceEditing, setIsResourceEditing] = useState(false);
  const [isReplicasEditing, setIsReplicasEditing] = useState(false);

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

  // Form for resource editing
  const form = useForm<LaunchpadCreateRequest>({
    defaultValues: {
      resource: {
        cpu: launchpadObject?.resource?.cpu?.toString() || "2",
        memory: launchpadObject?.resource?.memory?.toString() || "4",
      },
    },
  });

  // Form for replicas editing
  const replicasForm = useForm<LaunchpadCreateRequest>({
    defaultValues: {
      resource: {
        replicas: launchpadObject?.resource?.replicas?.toString() || "1",
      },
    },
  });

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

  const handleImageSave = async () => {
    if (isSubmitting || !imageValue.trim()) return;

    setIsSubmitting(true);

    try {
      const updateRequest = {
        name: target.name!,
        request: {
          image: imageValue.trim(),
        },
      };

      await updateLaunchpad.mutateAsync(updateRequest, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: launchpad.getLaunchpad.queryKey(target),
          });
          toast.success("Image updated successfully!");
          setIsEditingImage(false);
        },
        onError: () => {
          toast.error("Failed to update image");
        },
      });
    } catch (error) {
      console.error("Failed to update launchpad image:", error);
      toast.error("Failed to update image");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageCancel = () => {
    setIsEditingImage(false);
    setImageValue(image || "");
  };

  const handleImageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleImageSave();
    } else if (e.key === "Escape") {
      handleImageCancel();
    }
  };

  const handleResourceSave = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formValues = form.getValues();
      const resourceData: any = {};

      if (formValues.resource?.cpu !== undefined)
        resourceData.cpu = parseInt(formValues.resource.cpu);
      if (formValues.resource?.memory !== undefined)
        resourceData.memory = parseInt(formValues.resource.memory);

      const updateRequest = {
        name: target.name!,
        request: {
          resource: resourceData,
        },
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResourceCancel = () => {
    // Reset form to original values
    form.reset({
      resource: {
        cpu: launchpadObject?.resource?.cpu?.toString() || "2",
        memory: launchpadObject?.resource?.memory?.toString() || "4",
      },
    });
    setIsResourceEditing(false);
  };

  const handleReplicasSave = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formValues = replicasForm.getValues();
      const resourceData: any = {};

      if (formValues.resource?.replicas !== undefined)
        resourceData.replicas = parseInt(formValues.resource.replicas);

      const updateRequest = {
        name: target.name!,
        request: {
          resource: resourceData,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplicasCancel = () => {
    // Reset form to original values
    replicasForm.reset({
      resource: {
        replicas: launchpadObject?.resource?.replicas?.toString() || "1",
      },
    });
    setIsReplicasEditing(false);
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
              {isSubmitting ? (
                <div className="flex items-center gap-2 flex-1">
                  <Spinner variant="bars" className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    Updating image...
                  </span>
                </div>
              ) : (
                <>
                  <Input
                    value={imageValue}
                    onChange={(e) => setImageValue(e.target.value)}
                    onKeyDown={handleImageKeyDown}
                    placeholder="Enter image URL (e.g., nginx:latest)"
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleImageSave}
                    disabled={isSubmitting || !imageValue.trim()}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleImageCancel}
                    disabled={isSubmitting}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
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
                onClick={handleResourceSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Spinner variant="bars" className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-1"
                onClick={handleResourceCancel}
                disabled={isSubmitting}
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
            <FormProvider {...form}>
              <ResourceConfiguration form={form} showReplicas={false} />
            </FormProvider>
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
                onClick={handleReplicasSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Spinner variant="bars" className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-1"
                onClick={handleReplicasCancel}
                disabled={isSubmitting}
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
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Replicas:</span>
                <span className="text-sm">{replicasForm.watch("resource.replicas") || REPLICAS_OPTIONS[0]}</span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[REPLICAS_OPTIONS.findIndex((option) => option === parseInt(replicasForm.watch("resource.replicas") || REPLICAS_OPTIONS[0].toString())) || 0]}
                  onValueChange={(value) =>
                    replicasForm.setValue("resource.replicas", REPLICAS_OPTIONS[value[0]].toString())
                  }
                  min={0}
                  max={REPLICAS_OPTIONS.length - 1}
                  step={1}
                  className="[&>:last-child>span]:h-6 [&>:last-child>span]:w-2.5 [&>:last-child>span]:border-[3px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
                  aria-label="Replicas slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{REPLICAS_OPTIONS[0]}</span>
                  <span>{REPLICAS_OPTIONS[REPLICAS_OPTIONS.length - 1]}</span>
                </div>
              </div>
            </div>
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
        </div>
        <div className="p-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Command</span>
            <span className="text-sm font-medium truncate max-w-[200px]">
              {command || "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Env Variables</span>
            <span className="text-sm font-medium">
              {envVars.length > 0 ? `${envVars.length} variables` : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Config Map</span>
            <span className="text-sm font-medium">
              {(launchpadObject as any).configMap && (launchpadObject as any).configMap.length > 0
                ? `${(launchpadObject as any).configMap.length} items`
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Volumes</span>
            <span className="text-sm font-medium">
              {(launchpadObject as any).storage && (launchpadObject as any).storage.length > 0
                ? `${(launchpadObject as any).storage.length} volumes`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>


    </div>
  );
};

export default LaunchpadMessageDetails;
