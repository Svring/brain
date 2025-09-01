"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useLaunchpadUpdateForm } from "@/hooks/forms/launchpad/use-launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { ImageField } from "@/components/forms/universal/image-field";
import { ResourceFields } from "../universal/resource-fields";
import { EnvFields } from "../universal/env-fields";
import {
  CommandField,
  ArgsField,
} from "@/components/forms/universal/command-args-fields";

interface LaunchpadUpdateFormProps {
  defaultValues?: Partial<LaunchpadUpdateFormData>;
  onSubmit: (data: LaunchpadUpdateFormData) => void;
  isLoading?: boolean;
}

export const LaunchpadUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
}: LaunchpadUpdateFormProps) => {
  const { form, envFieldArray } = useLaunchpadUpdateForm(defaultValues);

  const handleSubmit = (data: LaunchpadUpdateFormData) => {
    // onSubmit(data);
    console.log(data);
  };

  // Only show fields that have values in defaultValues
  const hasImage = defaultValues?.image !== undefined;
  const hasResource = defaultValues?.resource !== undefined;
  const hasEnv = defaultValues?.env !== undefined;
  const hasCommand = defaultValues?.command !== undefined;
  const hasArgs = defaultValues?.args !== undefined;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {hasImage && (
          <div className="space-y-4">
            <ImageField />
          </div>
        )}

        {hasResource && <ResourceFields />}

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

        <div className="flex justify-end">
          <Button type="submit" variant="outline" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
