"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useClusterCreateForm } from "@/hooks/forms/cluster/use-cluster-create-form";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { NameField } from "@/components/forms/universal/name-field";
import { ResourceFields } from "../universal/resource-fields";
import { ClusterTypeField } from "./components/cluster-type-field";
import { ClusterTerminationPolicyField } from "./components/cluster-termination-policy-field";
import {
  CPU_OPTIONS,
  MEMORY_OPTIONS,
  REPLICAS_OPTIONS,
  STORAGE_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";

interface ClusterCreateFormProps {
  defaultValues?: Partial<ClusterCreateFormData>;
  onSubmit: (data: ClusterCreateFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
}

export const ClusterCreateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
}: ClusterCreateFormProps) => {
  const { form } = useClusterCreateForm(defaultValues);

  const handleSubmit = (data: any) => {
    onSubmit(data as ClusterCreateFormData);
  };

  return (
    <Form {...form}>
      <form id="cluster-create-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <NameField />
          
          <ClusterTypeField />
          
          <ClusterTerminationPolicyField />
        </div>

        <ResourceFields 
          cpuOptions={CPU_OPTIONS}
          memoryOptions={[...MEMORY_OPTIONS, 32]}
          replicasOptions={REPLICAS_OPTIONS}
          storageOptions={STORAGE_OPTIONS}
        />

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
