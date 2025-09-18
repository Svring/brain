"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { nanoid } from "nanoid";
import { ClusterTypeField } from "./components/cluster-type-field";
import { NameField } from "@/components/forms/universal/name-field";
import { useEffect } from "react";
import { CLUSTER_CONSTANT_TYPE_VERSION } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-versions";
import { toast } from "sonner";

// Use the main schema for parsing with default values
export type ClusterSimpleFormData = z.infer<typeof clusterCreateFormSchema>;

interface ClusterCreateSimpleFormProps {
  defaultValues?: Partial<ClusterSimpleFormData>;
  onSubmit: (data: ClusterSimpleFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
}

export const ClusterCreateSimpleForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
}: ClusterCreateSimpleFormProps) => {
  // Get default values from schema
  const schemaDefaults = clusterCreateFormSchema.parse({});

  const form = useForm<ClusterSimpleFormData>({
    resolver: zodResolver(clusterCreateFormSchema),
    defaultValues: {
      ...schemaDefaults,
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Set default values for hidden fields
  useEffect(() => {
    // Set default termination policy to "Delete"
    form.setValue("terminationPolicy", "Delete");
    
    // Set default version to first available version for the selected type
    const selectedType = form.getValues("type");
    if (selectedType && CLUSTER_CONSTANT_TYPE_VERSION[selectedType as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION]) {
      const versions = CLUSTER_CONSTANT_TYPE_VERSION[selectedType as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION];
      if (versions && versions.length > 0) {
        form.setValue("version", versions[0]);
      }
    }
  }, [form]);

  const handleSubmit = (data: ClusterSimpleFormData) => {
    // Data cleaning is now handled by individual field components
    // console.log("Submitting simple cluster form data:", JSON.stringify(data, null, 2));
    onSubmit(data);
  };

  const handleSubmitError = (errors: any) => {
    console.log("Simple cluster form validation errors:", errors);

    // Handle form validation errors with more specific messages
    if (errors.type) {
      toast.error(
        "Cluster type validation failed. Please check your cluster type selection."
      );
    } else if (errors.version) {
      toast.error(
        "Cluster version validation failed. Please check your version selection."
      );
    } else if (errors.terminationPolicy) {
      toast.error(
        "Termination policy validation failed. Please check your termination policy selection."
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
        id="cluster-create-simple-form"
        onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)}
        className="space-y-6"
      >
        {/* Basic Configuration */}
        <div className="space-y-4">
          <NameField />
          <div className="space-y-2">
            <ClusterTypeField />
          </div>
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
