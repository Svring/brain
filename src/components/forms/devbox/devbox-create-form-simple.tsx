"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";
import { DevboxRuntimeSchema } from "@/schemas/forms/devbox/components/devbox-runtime-schema";
import { DevboxPortCreateSchema } from "@/schemas/forms/devbox/components/devbox-port-schema";
import { NameField } from "@/components/forms/universal/name-field";
import { DevboxRuntimeField } from "./components/devbox-runtime-field";
import { DevboxPortsFields } from "./devbox-ports-fields";
import { toast } from "sonner";

// Simplified schema with only the required fields
const devboxSimpleFormSchema = z.object({
  name: z
    .string()
    .min(1, "Devbox name is required")
    .max(63, "Devbox name must be 63 characters or less")
    .regex(
      /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
      "Devbox name must be DNS compliant: lowercase, numbers, hyphens only"
    )
    .default("my-devbox"),
  runtime: DevboxRuntimeSchema.default("python"),
  ports: z.array(DevboxPortCreateSchema).default([
    {
      number: 80,
      protocol: "HTTP",
      exposesPublicDomain: true,
    },
  ]),
});

export type DevboxSimpleFormData = z.infer<typeof devboxSimpleFormSchema>;

interface DevboxCreateSimpleFormProps {
  defaultValues?: Partial<DevboxSimpleFormData>;
  onSubmit: (data: DevboxSimpleFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
  formId?: string;
}

export const DevboxCreateSimpleForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
  formId = "devbox-create-simple-form",
}: DevboxCreateSimpleFormProps) => {
  // Get default values from schema
  const schemaDefaults = devboxSimpleFormSchema.parse({});
  
  const form = useForm<DevboxSimpleFormData>({
    resolver: zodResolver(devboxSimpleFormSchema),
    defaultValues: {
      ...schemaDefaults,
      ...defaultValues,
    },
    mode: "onBlur",
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
        "Runtime validation failed. Please check your runtime selection."
      );
    } else if (errors.name) {
      toast.error(
        "Devbox name validation failed. Please check your devbox name."
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
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)}
        className="space-y-6"
      >
        <div className="space-y-4">
          <NameField />
          <DevboxRuntimeField />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Ports</div>
          <DevboxPortsFields fieldArray={portsFieldArray} />
        </div>

        {!hideDefaultButton && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              form={formId}
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
