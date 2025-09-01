"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useLaunchpadCreateForm } from "@/hooks/forms/launchpad/use-launchpad-create-form";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { NameField } from "@/components/forms/universal/name-field";
import { ImageField } from "@/components/forms/universal/image-field";
import { ResourceFields } from "../universal/resource-fields";
import { PortsFields } from "../universal/ports-fields";
import { EnvFields } from "../universal/env-fields";
import {
  CommandField,
  ArgsField,
} from "@/components/forms/universal/command-args-fields";

interface LaunchpadCreateFormProps {
  defaultValues?: Partial<LaunchpadCreateFormData>;
  onSubmit: (data: LaunchpadCreateFormData) => void;
  isLoading?: boolean;
}

export const LaunchpadCreateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
}: LaunchpadCreateFormProps) => {
  const { form, portsFieldArray, envFieldArray } =
    useLaunchpadCreateForm(defaultValues);

  const handleSubmit = (data: LaunchpadCreateFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <NameField />
          <ImageField />
        </div>

        <ResourceFields />

        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Ports</div>
          <PortsFields fieldArray={portsFieldArray} />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">
            Environment Variables
          </div>
          <EnvFields fieldArray={envFieldArray} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CommandField />
          <ArgsField />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
