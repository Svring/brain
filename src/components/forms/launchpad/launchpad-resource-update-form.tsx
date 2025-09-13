"use client";

import { Form } from "@/components/ui/form";
import { useLaunchpadUpdateForm } from "@/hooks/forms/launchpad/use-launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { LaunchpadResourceFieldsSimple } from "./launchpad-resource-fields-simple";

interface LaunchpadResourceUpdateFormProps {
  defaultValues?: Partial<LaunchpadUpdateFormData>;
  onSubmit: (data: LaunchpadUpdateFormData) => void;
  isLoading?: boolean;
  formId?: string;
}

export const LaunchpadResourceUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  formId = "launchpad-resource-update-form",
}: LaunchpadResourceUpdateFormProps) => {
  const { form } = useLaunchpadUpdateForm(defaultValues);

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

    console.log("filtered resource data", filteredData);
    onSubmit(filteredData as LaunchpadUpdateFormData);
  };

  // Only show resource fields
  const hasResource = defaultValues?.resource !== undefined;

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        {hasResource && <LaunchpadResourceFieldsSimple />}
      </form>
    </Form>
  );
};
