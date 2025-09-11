"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useLaunchpadUpdateForm } from "@/hooks/forms/launchpad/use-launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { LaunchpadResourceFields } from "./launchpad-resource-fields";
import { LaunchpadPortsFields } from "./launchpad-ports-fields";
import { LaunchpadSimplePortsFields } from "./launchpad-simple-ports-fields";
import { CommandField, ArgsField } from "../universal/command-args-fields";
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
  useSimplePortsMode?: boolean;
  formId?: string;
}

export const LaunchpadUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
  useSimplePortsMode = false,
  formId = "launchpad-update-form",
}: LaunchpadUpdateFormProps) => {
  const {
    form,
    portsFieldArray,
    simplePortsFieldArray,
    envFieldArray,
    storageFieldArray,
    configMapFieldArray,
  } = useLaunchpadUpdateForm(defaultValues);

  const handleSubmit = (data: LaunchpadUpdateFormData) => {
    // Filter out empty arrays and undefined values to only submit relevant fields
    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      // Only include the field if it has a meaningful value
      if (value !== undefined && value !== null) {
        // For arrays, only include if they have items
        if (Array.isArray(value)) {
          if (value.length > 0) {
            (acc as any)[key] = value;
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

    console.log("filtered data", filteredData);
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
  const hasPorts = defaultValues?.ports !== undefined;
  const hasSimplePorts = defaultValues?.simplePorts !== undefined;
  const hasLaunchCommand = defaultValues?.launchCommand !== undefined;
  const hasImage = defaultValues?.image !== undefined;
  const hasEnv = defaultValues?.env !== undefined;
  const hasConfigMap = defaultValues?.configMap !== undefined;
  const hasStorage = defaultValues?.storage !== undefined;

  // Determine which ports field to show
  const showSimplePortsField = useSimplePortsMode || hasSimplePorts;
  const showRegularPortsField = hasPorts && !showSimplePortsField;

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
            <div className="text-sm font-medium text-foreground">
              Image Configuration
            </div>
            <ImageConfigFields />
          </div>
        )}

        {hasResource && <LaunchpadResourceFields />}

        {showRegularPortsField && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Ports</div>
            <LaunchpadPortsFields fieldArray={portsFieldArray} />
          </div>
        )}

        {showSimplePortsField && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              Port Operations
            </div>
            <LaunchpadSimplePortsFields fieldArray={simplePortsFieldArray} />
          </div>
        )}

        {/* Launch Command Fields */}
        {hasLaunchCommand && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              Launch Command
            </div>
            <LaunchCommandFields />
          </div>
        )}

        {/* Environment Variables */}
        {hasEnv && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              Environment Variables
            </div>
            <EnvFields fieldArray={envFieldArray} />
          </div>
        )}

        {/* Config Map */}
        {hasConfigMap && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              Config Map
            </div>
            <ConfigMapFields fieldArray={configMapFieldArray} />
          </div>
        )}

        {/* Storage */}
        {hasStorage && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Storage</div>
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
