"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useDevboxUpdateForm } from "@/hooks/forms/devbox/use-devbox-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { ResourceFields } from "../universal/resource-fields";

interface DevboxUpdateFormProps {
  defaultValues?: Partial<DevboxUpdateFormData>;
  onSubmit: (data: DevboxUpdateFormData) => void;
  isLoading?: boolean;
}

export const DevboxUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
}: DevboxUpdateFormProps) => {
  const { form } = useDevboxUpdateForm(defaultValues);

  const handleSubmit = (data: DevboxUpdateFormData) => {
    // onSubmit(data);
    console.log(data);
  };

  // Only show fields that have values in defaultValues
  const hasResource = defaultValues?.resource !== undefined;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {hasResource && <ResourceFields />}

        <div className="flex justify-end">
          <Button type="submit" variant="outline" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
