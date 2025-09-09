"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useDevboxCreateForm } from "@/hooks/forms/devbox/use-devbox-create-form";
import { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { NameField } from "@/components/forms/universal/name-field";
import { ResourceFields } from "../universal/resource-fields";
import { DevboxPortsFields } from "./devbox-ports-fields";
import { DevboxRuntimeField } from "./components/devbox-runtime-field";

interface DevboxCreateFormProps {
  defaultValues?: Partial<DevboxCreateFormData>;
  onSubmit: (data: DevboxCreateFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
  formId?: string;
}

export const DevboxCreateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
  formId = "devbox-create-form",
}: DevboxCreateFormProps) => {
  const { form, portsFieldArray } = useDevboxCreateForm(defaultValues);

  const handleSubmit = (data: any) => {
    onSubmit(data as DevboxCreateFormData);
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <NameField />
          <DevboxRuntimeField />
        </div>

        <ResourceFields
          cpuOptions={[0.1, 0.2, 0.5, 1, 2, 4, 8, 16]}
          memoryOptions={[0.1, 0.5, 1, 2, 4, 8, 16, 32]}
        />

        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Ports</div>
          <DevboxPortsFields fieldArray={portsFieldArray} />
        </div>

        {!hideDefaultButton && (
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
        )}
      </form>
    </Form>
  );
};
