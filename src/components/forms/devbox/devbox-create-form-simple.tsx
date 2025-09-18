"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { nanoid } from "nanoid";
import { DevboxRuntimeField } from "./components/devbox-runtime-field";
import { DevboxPortsFields } from "./devbox-ports-fields";
import { NameField } from "@/components/forms/universal/name-field";
import { toast } from "sonner";

// Use the main schema for parsing with default values
export type DevboxSimpleFormData = z.infer<typeof devboxCreateFormSchema>;

interface DevboxCreateSimpleFormProps {
  defaultValues?: Partial<DevboxSimpleFormData>;
  onSubmit: (data: DevboxSimpleFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
}

export const DevboxCreateSimpleForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
}: DevboxCreateSimpleFormProps) => {
  // Get default values from schema
  const schemaDefaults = devboxCreateFormSchema.parse({});

  const form = useForm<DevboxSimpleFormData>({
    resolver: zodResolver(devboxCreateFormSchema),
    defaultValues: {
      ...schemaDefaults,
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Only ports field array is needed for the simple form
  const portsFieldArray = useFieldArray({
    control: form.control,
    name: "ports",
  });

  const handleSubmit = (data: DevboxSimpleFormData) => {
    // Data cleaning is now handled by individual field components
    // console.log("Submitting simple devbox form data:", JSON.stringify(data, null, 2));
    onSubmit(data);
  };

  const handleSubmitError = (errors: any) => {
    console.log("Simple devbox form validation errors:", errors);

    // Handle form validation errors with more specific messages
    if (errors.ports) {
      toast.error(
        "Port validation failed. Please check for duplicate port numbers."
      );
    } else if (errors.runtime) {
      toast.error(
        "Runtime configuration validation failed. Please check your runtime settings."
      );
    } else {
      // Show the first error message for better debugging
      const firstError = Object.keys(errors)[0];
      const errorMessage =
        errors[firstError]?.message || "Unknown validation error";
      toast.error(`Form validation failed: ${firstError} - ${errorMessage}`);
    }
  };

  return (
    <Form {...form}>
      <form
        id="devbox-create-simple-form"
        onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)}
        className="space-y-6"
      >
        {/* Basic Configuration */}
        <div className="space-y-4">
          <NameField />
          <div className="space-y-2">
            <DevboxRuntimeField />
          </div>
        </div>

        {/* Ports Configuration */}
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
