"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useLaunchpadUpdateForm } from "@/hooks/forms/launchpad/use-launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { LaunchpadResourceFieldsSimple } from "./launchpad-resource-fields-simple";
import { LaunchpadPortsFields } from "./launchpad-ports-fields";
import { EnvFields } from "../universal/env-fields";
import { ConfigMapFields } from "../universal/config-map-fields";
import { StorageFields } from "../universal/storage-fields";
import { LaunchCommandFields } from "../universal/launch-command-fields";
import { ImageConfigFields } from "../universal/image-config-fields";
import { toast } from "sonner";

interface LaunchpadUpdateFormProps {
  defaultValues?: Partial<LaunchpadUpdateFormData>;
  onSubmit: (data: LaunchpadUpdateFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
  formId?: string;
}

export const LaunchpadUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
  formId = "launchpad-update-form",
}: LaunchpadUpdateFormProps) => {
  const {
    form,
    portsFieldArray,
    envFieldArray,
    storageFieldArray,
    configMapFieldArray,
  } = useLaunchpadUpdateForm(defaultValues);

  const handleSubmit = (data: LaunchpadUpdateFormData) => {
    console.log(
      "Raw form data before filtering:",
      JSON.stringify(data, null, 2)
    );

    // Filter out empty arrays and undefined values to only submit relevant fields
    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      // Only include the field if it has a meaningful value
      if (value !== undefined && value !== null) {
        // For arrays, only include if they have items
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // Special handling for env array - filter out items with empty names
            if (key === "env") {
              const validEnvVars = value.filter(
                (env: any) => env && env.name && env.name.trim() !== ""
              );
              if (validEnvVars.length > 0) {
                (acc as any)[key] = validEnvVars;
              }
            }
            // Special handling for configMap array - filter out items with empty paths
            else if (key === "configMap") {
              const validConfigMaps = value.filter(
                (configMap: any) =>
                  configMap && configMap.path && configMap.path.trim() !== ""
              );
              if (validConfigMaps.length > 0) {
                (acc as any)[key] = validConfigMaps;
              }
            }
            // Special handling for storage array - filter out items with empty paths
            else if (key === "storage") {
              const validStorage = value.filter(
                (storage: any) =>
                  storage && storage.path && storage.path.trim() !== ""
              );
              if (validStorage.length > 0) {
                (acc as any)[key] = validStorage;
              }
            } else {
              (acc as any)[key] = value;
            }
          }
        } else {
          // For objects, only include if they have properties
          if (typeof value === "object" && Object.keys(value).length > 0) {
            (acc as any)[key] = value;
          } else if (typeof value !== "object") {
            // For primitives, include if they have a value
            (acc as any)[key] = value;
          }
        }
      }
      return acc;
    }, {} as Record<string, any>);

    // Handle image registry: if all registry fields are empty strings, set to null
    if (filteredData.image && filteredData.image.imageRegistry) {
      const { username, password, serverAddress } =
        filteredData.image.imageRegistry;
      if (!username && !password && !serverAddress) {
        filteredData.image.imageRegistry = null;
      }
    }

    onSubmit(filteredData as LaunchpadUpdateFormData);
  };

  const handleSubmitError = (errors: any) => {
    console.log("Form validation errors:", errors);

    // Handle form validation errors with more specific messages
    if (errors.ports) {
      toast.error(
        "Port validation failed. Please check for duplicate port numbers."
      );
    } else if (errors.simplePorts) {
      toast.error(
        "Port operations validation failed. Please check for duplicate port numbers."
      );
    } else if (errors.launchCommand) {
      toast.error(
        "Launch command validation failed. Please check your command and arguments."
      );
    } else if (errors.resource) {
      toast.error(
        "Resource validation failed. Please check your CPU, memory, and scaling settings."
      );
    } else {
      // Show the first error message for better debugging
      const firstError = Object.keys(errors)[0];
      const errorMessage =
        errors[firstError]?.message || "Unknown validation error";
      toast.error(`Form validation failed: ${firstError} - ${errorMessage}`);
    }
  };

  // Only show fields that have values in defaultValues
  const hasResource = defaultValues?.resource !== undefined;
  const hasPorts =
    defaultValues?.ports !== undefined && defaultValues.ports.length > 0;
  const hasLaunchCommand = defaultValues?.launchCommand !== undefined;
  const hasImage = defaultValues?.image !== undefined;
  const hasEnv =
    defaultValues?.env !== undefined && defaultValues.env.length > 0;
  const hasConfigMap =
    defaultValues?.configMap !== undefined;
  const hasStorage =
    defaultValues?.storage !== undefined && defaultValues.storage.length > 0;

  // console.log("LaunchpadUpdateForm - defaultValues:", defaultValues);
  // console.log("LaunchpadUpdateForm - hasResource:", hasResource);
  // console.log("LaunchpadUpdateForm - hasPorts:", hasPorts);
  // console.log("LaunchpadUpdateForm - hasLaunchCommand:", hasLaunchCommand);
  // console.log("LaunchpadUpdateForm - hasImage:", hasImage);
  // console.log("LaunchpadUpdateForm - hasEnv:", hasEnv);
  // console.log("LaunchpadUpdateForm - hasConfigMap:", hasConfigMap);
  // console.log("LaunchpadUpdateForm - hasStorage:", hasStorage);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)}
        className="space-y-6"
      >
        {/* Image Configuration */}
        {hasImage && (
          <div className="space-y-2">
            <ImageConfigFields />
          </div>
        )}

        {hasResource && <LaunchpadResourceFieldsSimple />}

        {hasPorts && (
          <div className="space-y-2">
            <LaunchpadPortsFields fieldArray={portsFieldArray} />
          </div>
        )}

        {/* Launch Command Fields */}
        {hasLaunchCommand && (
          <div className="space-y-2">
            <LaunchCommandFields />
          </div>
        )}

        {/* Environment Variables */}
        {hasEnv && (
          <div className="space-y-2">
            <EnvFields fieldArray={envFieldArray} />
          </div>
        )}

        {/* Config Map */}
        {hasConfigMap && (
          <div className="space-y-2">
            <ConfigMapFields fieldArray={configMapFieldArray} />
          </div>
        )}

        {/* Storage */}
        {hasStorage && (
          <div className="space-y-2">
            <StorageFields fieldArray={storageFieldArray} />
          </div>
        )}

        {!hideDefaultButton && (
          <div className="flex justify-end">
            <Button type="submit" variant="outline" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
