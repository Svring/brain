"use client";

import { Form } from "@/components/ui/form";
import { useLaunchpadUpdateForm } from "@/hooks/forms/launchpad/use-launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { LaunchpadDeploymentFields } from "./launchpad-deployment-fields";
import { useState } from "react";

interface LaunchpadDeploymentUpdateFormProps {
  defaultValues?: Partial<LaunchpadUpdateFormData>;
  onSubmit: (data: LaunchpadUpdateFormData) => void;
  isLoading?: boolean;
  formId?: string;
  initialScalingMode?: "replicas" | "hpa";
}

export const LaunchpadDeploymentUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  formId = "launchpad-deployment-update-form",
  initialScalingMode = "replicas",
}: LaunchpadDeploymentUpdateFormProps) => {
  const { form } = useLaunchpadUpdateForm(defaultValues);
  const [scalingMode, setScalingMode] = useState<"replicas" | "hpa">(initialScalingMode);

  const handleSubmit = (data: LaunchpadUpdateFormData) => {
    // Create a filtered data object that only includes the relevant scaling field
    const filteredData: LaunchpadUpdateFormData = {
      name: data.name,
    };

    // Only include the resource field if it exists
    if (data.resource) {
      filteredData.resource = {};

      // Based on the current scaling mode, only submit the relevant field
      if (scalingMode === "replicas") {
        // Only submit replicas, exclude hpa
        if (data.resource.replicas !== undefined) {
          filteredData.resource.replicas = data.resource.replicas;
        }
      } else if (scalingMode === "hpa") {
        // Only submit hpa, exclude replicas
        if (data.resource.hpa !== undefined && data.resource.hpa !== null) {
          filteredData.resource.hpa = data.resource.hpa;
        }
      }

      // Always include cpu and memory if they exist
      if (data.resource.cpu !== undefined) {
        filteredData.resource.cpu = data.resource.cpu;
      }
      if (data.resource.memory !== undefined) {
        filteredData.resource.memory = data.resource.memory;
      }
    }

    console.log("filtered deployment data", filteredData);
    onSubmit(filteredData);
  };

  // Only show deployment fields (replicas and hpa)
  const hasResource = defaultValues?.resource !== undefined;

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        {hasResource && (
          <LaunchpadDeploymentFields 
            scalingMode={scalingMode}
            onScalingModeChange={setScalingMode}
          />
        )}
      </form>
    </Form>
  );
};
