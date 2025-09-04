"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useDevboxUpdateForm } from "@/hooks/forms/devbox/use-devbox-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { ResourceFields } from "../universal/resource-fields";
import { DevboxPortsFields } from "./devbox-ports-fields";

interface DevboxUpdateFormProps {
  defaultValues?: Partial<DevboxUpdateFormData>;
  onSubmit: (data: DevboxUpdateFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
}

export const DevboxUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
}: DevboxUpdateFormProps) => {
  const { form, portsFieldArray } = useDevboxUpdateForm(defaultValues);

  const handleSubmit = (data: DevboxUpdateFormData) => {
    onSubmit(data);
  };

  // Only show fields that have values in defaultValues
  const hasResource = defaultValues?.resource !== undefined;
  const hasPorts = defaultValues?.ports !== undefined;

  return (
    <Form {...form}>
      <form
        id="devbox-update-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        {hasResource && <ResourceFields />}

        {hasPorts && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Ports</div>
            <DevboxPortsFields fieldArray={portsFieldArray} />
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
