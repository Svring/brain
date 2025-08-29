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
      key: envVar.name || envVar.key,
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

      {/* CPU, Memory, and Replicas in a single row with borders */}
      <div className="flex items-center border rounded-lg p-3">
        <div className="flex-1 text-center border-r last:border-r-0">
          <div className="text-sm text-muted-foreground">CPU</div>
          <div className="text-sm font-medium">
            {launchpadObject.resource?.cpu}Core
          </div>
        </div>
        <div className="flex-1 text-center border-r last:border-r-0">
          <div className="text-sm text-muted-foreground">Memory</div>
          <div className="text-sm font-medium">
            {launchpadObject.resource?.memory}GB
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-sm text-muted-foreground">Replicas</div>
          <div className="text-sm font-medium">
            {launchpadObject.resource?.replicas || "N/A"}
          </div>
        </div>
      </div>

      {/* Environment Variables and Related Items */}
      <Accordion type="multiple" className="w-full space-y-1">
        <AccordionItem
          value="environment"
          className="inset-ring inset-ring-border rounded-lg"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <ChevronDown className="h-4 w-4" />
              <Database className="h-4 w-4" />
              <span className="font-medium">Environment Variables</span>
              {envVars.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {envVars.length}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            {envVars.length > 0 ? (
              <div className="space-y-2">
                {envVars.map((envVar, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                  >
                    <span className="text-sm font-medium">{envVar.key}</span>
                    <span className="text-sm text-muted-foreground">
                      {envVar.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No environment variables configured
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Launch Command */}
        {(command || args) && (
          <AccordionItem
            value="launch-command"
            className="inset-ring inset-ring-border rounded-lg"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <Terminal className="h-4 w-4" />
                <span className="font-medium">Launch Command</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              {command && (
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Command</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {command}
                  </code>
                </div>
              )}
              {args && (
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Arguments
                  </span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {args}
                  </code>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Config Map - Only show if configMap exists in the schema */}
        {(launchpadObject as any).configMap &&
          (launchpadObject as any).configMap.length > 0 && (
            <AccordionItem
              value="config-map"
              className="inset-ring inset-ring-border rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4" />
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Config Map</span>
                  <Badge variant="secondary" className="ml-auto">
                    {(launchpadObject as any).configMap.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                {(launchpadObject as any).configMap.map(
                  (config: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          Path: {config.path}
                        </span>
                        <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                          {config.value}
                        </code>
                      </div>
                    </div>
                  )
                )}
              </AccordionContent>
            </AccordionItem>
          )}

        {/* Storage - Only show if storage exists in the schema */}
        {(launchpadObject as any).storage &&
          (launchpadObject as any).storage.length > 0 && (
            <AccordionItem
              value="storage"
              className="inset-ring inset-ring-border rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4" />
                  <Database className="h-4 w-4" />
                  <span className="font-medium">Storage</span>
                  <Badge variant="secondary" className="ml-auto">
                    {(launchpadObject as any).storage.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                {(launchpadObject as any).storage.map(
                  (storage: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {storage.name}
                        </span>
                        <Badge variant="outline">{storage.size}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Mount Path: {storage.path}
                      </div>
                    </div>
                  )
                )}
              </AccordionContent>
            </AccordionItem>
          )}
      </Accordion>
    </div>
  );
};

export default LaunchpadMessageDetails;
