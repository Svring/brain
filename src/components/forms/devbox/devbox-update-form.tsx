"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useDevboxUpdateForm } from "@/hooks/forms/devbox/use-devbox-update-form";
import { DevboxUpdateFormData } from "@/schemas/forms/devbox/devbox-update-form-schema";
import { DevboxResourceFields } from "./devbox-resource-fields";
import { DevboxPortsFields } from "./devbox-ports-fields";
import { toast } from "sonner";

interface DevboxUpdateFormProps {
  defaultValues?: Partial<DevboxUpdateFormData>;
  onSubmit: (data: DevboxUpdateFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
  hidePorts?: boolean;
}

export const DevboxUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
  hidePorts = false,
}: DevboxUpdateFormProps) => {
  const { form, portsFieldArray } = useDevboxUpdateForm(defaultValues);

  const handleSubmit = (data: DevboxUpdateFormData) => {
    // If ports are hidden, exclude ports data from submission
    if (hidePorts) {
      const { ports, ...dataWithoutPorts } = data;
      onSubmit(dataWithoutPorts);
    } else {
      onSubmit(data);
    }
  };

  const handleSubmitError = (errors: any) => {
    // Handle form validation errors
    if (errors.ports) {
      toast.error(
        "Port validation failed. Please check for duplicate port numbers."
      );
    } else {
      toast.error("Form validation failed. Please check your inputs.");
    }
  };

  // Only show fields that have values in defaultValues
  const hasResource = defaultValues?.resource !== undefined;
  const hasPorts = defaultValues?.ports !== undefined && defaultValues.ports.length > 0;

  // console.log("DevboxUpdateForm - defaultValues:", defaultValues);
  // console.log("DevboxUpdateForm - hasResource:", hasResource);
  // console.log("DevboxUpdateForm - hasPorts:", hasPorts);

  return (
    <Form {...form}>
      <form
        id="devbox-update-form"
        onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)}
        className="space-y-6"
      >
        {hasResource && <DevboxResourceFields />}

        {!hidePorts && hasPorts && (
          <DevboxPortsFields fieldArray={portsFieldArray} />
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
