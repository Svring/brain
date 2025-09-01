"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useClusterUpdateForm } from "@/hooks/forms/cluster/use-cluster-update-form";
import { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";
import { ResourceFields } from "../universal/resource-fields";

interface ClusterUpdateFormProps {
  defaultValues?: Partial<ClusterUpdateFormData>;
  onSubmit: (data: ClusterUpdateFormData) => void;
  isLoading?: boolean;
}

export const ClusterUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
}: ClusterUpdateFormProps) => {
  const { form } = useClusterUpdateForm(defaultValues);

  const handleSubmit = (data: ClusterUpdateFormData) => {
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
