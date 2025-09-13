"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useClusterUpdateForm } from "@/hooks/forms/cluster/use-cluster-update-form";
import { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";
import { ResourceFields } from "../universal/resource-fields";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  REPLICAS_OPTIONS,
  STORAGE_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";

interface ClusterUpdateFormProps {
  defaultValues?: Partial<ClusterUpdateFormData>;
  onSubmit: (data: ClusterUpdateFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
  formId?: string;
}

export const ClusterUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
  formId = "cluster-update-form",
}: ClusterUpdateFormProps) => {
  const { form } = useClusterUpdateForm(defaultValues);

  const handleSubmit = (data: any) => {
    console.log("data", data);
    onSubmit(data as ClusterUpdateFormData);
  };

  // Only show fields that have values in defaultValues
  const hasResource = defaultValues?.resource !== undefined;

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        {hasResource && (
          <ResourceFields
            cpuOptions={CPU_OPTIONS}
            memoryOptions={[...MEMORY_OPTIONS, 32]}
            replicasOptions={REPLICAS_OPTIONS}
            storageOptions={STORAGE_OPTIONS}
          />
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
