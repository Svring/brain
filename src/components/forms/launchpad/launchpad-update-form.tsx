"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useLaunchpadUpdateForm } from "@/hooks/forms/launchpad/use-launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { ImageField } from "@/components/forms/universal/image-field";
import { ResourceFields } from "../universal/resource-fields";
import { LaunchpadPortsFields } from "./launchpad-ports-fields";
import { EnvFields } from "../universal/env-fields";
import {
  CommandField,
  ArgsField,
} from "@/components/forms/universal/command-args-fields";
import { StorageFields } from "../universal/storage-fields";
import { ConfigMapFields } from "../universal/config-map-fields";
import { Spinner } from "@/components/ui/spinner";

interface LaunchpadUpdateFormProps {
  defaultValues?: Partial<LaunchpadUpdateFormData>;
  onSubmit: (data: LaunchpadUpdateFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
}

export const LaunchpadUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
}: LaunchpadUpdateFormProps) => {
  const {
    form,
    portsFieldArray,
    envFieldArray,
    storageFieldArray,
    configMapFieldArray,
  } = useLaunchpadUpdateForm(defaultValues);

  const handleSubmit = (data: LaunchpadUpdateFormData) => {
    onSubmit(data);
  };

  const handleError = (errors: any) => {
    console.log("Form validation errors:", errors);
  };

  // Only show fields that have values in defaultValues
  const hasImage = defaultValues?.image !== undefined;
  const hasResource = defaultValues?.resource !== undefined;
  const hasPorts = defaultValues?.ports !== undefined;
  const hasEnv = defaultValues?.env !== undefined;
  const hasCommand = defaultValues?.command !== undefined;
  const hasArgs = defaultValues?.args !== undefined;
  const hasStorage = defaultValues?.storage !== undefined;
  const hasConfigMap = defaultValues?.configMap !== undefined;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner variant="bars" size={32} className="text-primary" />
          <p className="text-sm text-muted-foreground">Updating launchpad...</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        id="launchpad-update-form"
        onSubmit={form.handleSubmit(handleSubmit, handleError)}
        className="space-y-6"
      >
        {hasImage && (
          <div className="space-y-4">
            <ImageField />
          </div>
        )}

        {hasResource && <ResourceFields />}

        {hasPorts && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Ports</div>
            <LaunchpadPortsFields fieldArray={portsFieldArray} />
          </div>
        )}

        {hasEnv && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              Environment Variables
            </div>
            <EnvFields fieldArray={envFieldArray} />
          </div>
        )}

        {(hasCommand || hasArgs) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hasCommand && <CommandField />}
            {hasArgs && <ArgsField />}
          </div>
        )}

        {hasStorage && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              Storage Volumes
            </div>
            <StorageFields fieldArray={storageFieldArray} />
          </div>
        )}

        {hasConfigMap && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              Config Map Entries
            </div>
            <ConfigMapFields fieldArray={configMapFieldArray} />
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
