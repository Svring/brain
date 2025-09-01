"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useClusterCreateForm } from "@/hooks/forms/cluster/use-cluster-create-form";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { NameField } from "@/components/forms/universal/name-field";
import { ResourceFields } from "../universal/resource-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClusterCreateFormProps {
  defaultValues?: Partial<ClusterCreateFormData>;
  onSubmit: (data: ClusterCreateFormData) => void;
  isLoading?: boolean;
}

export const ClusterCreateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
}: ClusterCreateFormProps) => {
  const { form } = useClusterCreateForm(defaultValues);

  const handleSubmit = (data: ClusterCreateFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <NameField />
          
          <div className="space-y-2">
            <Label htmlFor="type">Cluster Type</Label>
            <Input
              id="type"
              {...form.register("type.type")}
              placeholder="e.g., kubernetes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Cluster Version</Label>
            <Input
              id="version"
              {...form.register("version.version")}
              placeholder="e.g., 1.28"
            />
          </div>
        </div>

        <ResourceFields />

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
      </form>
    </Form>
  );
};
