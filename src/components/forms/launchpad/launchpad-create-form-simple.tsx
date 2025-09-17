"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { nanoid } from "nanoid";
import { ImageConfigFields } from "../universal/image-config-fields";
import { LaunchpadPortsFields } from "./launchpad-ports-fields";
import { toast } from "sonner";

// Use the main schema for parsing with default values
export type LaunchpadSimpleFormData = z.infer<typeof launchpadCreateFormSchema>;

interface LaunchpadCreateSimpleFormProps {
  defaultValues?: Partial<LaunchpadSimpleFormData>;
  onSubmit: (data: LaunchpadSimpleFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
}

export const LaunchpadCreateSimpleForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
}: LaunchpadCreateSimpleFormProps) => {
  // Get default values from schema
  const schemaDefaults = launchpadCreateFormSchema.parse({});

  const form = useForm<LaunchpadSimpleFormData>({
    resolver: zodResolver(launchpadCreateFormSchema),
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

  const generateAppName = (): string => {
    // Use 'app' as prefix and append nanoid
    const uniqueId = nanoid(6);
    return `app-${uniqueId}`;
  };

  const handleSubmit = (data: LaunchpadSimpleFormData) => {
    // Generate name with 'app' prefix
    const generatedName = generateAppName();
    const dataWithGeneratedName = {
      ...data,
      name: generatedName,
    };

    // Data cleaning is now handled by individual field components
    // console.log("Submitting simple form data:", JSON.stringify(dataWithGeneratedName, null, 2));
    onSubmit(dataWithGeneratedName);
  };

  const handleSubmitError = (errors: any) => {
    console.log("Simple form validation errors:", errors);

    // Handle form validation errors with more specific messages
    if (errors.ports) {
      toast.error(
        "Port validation failed. Please check for duplicate port numbers."
      );
    } else if (errors.image) {
      toast.error(
        "Image configuration validation failed. Please check your image settings."
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
        id="launchpad-create-simple-form"
        onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)}
        className="space-y-6"
      >
        {/* Basic Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="font-medium text-foreground pb-2">
              Image Configuration
            </h2>
            <ImageConfigFields hidePrivateRegistry={true} />
          </div>
        </div>

        {/* Ports Configuration */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Ports</div>
          <LaunchpadPortsFields fieldArray={portsFieldArray} />
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
