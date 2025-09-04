"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useDevboxCreateForm } from "@/hooks/forms/devbox/use-devbox-create-form";
import { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { NameField } from "@/components/forms/universal/name-field";
import { ResourceFields } from "../universal/resource-fields";
import { DevboxPortsFields } from "./devbox-ports-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DevboxCreateFormProps {
  defaultValues?: Partial<DevboxCreateFormData>;
  onSubmit: (data: DevboxCreateFormData) => void;
  isLoading?: boolean;
}

export const DevboxCreateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
}: DevboxCreateFormProps) => {
  const { form, portsFieldArray } = useDevboxCreateForm(defaultValues);

  const handleSubmit = (data: any) => {
    onSubmit(data as DevboxCreateFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <NameField />

          <div className="space-y-2">
            <Label htmlFor="runtime">Runtime</Label>
            <Input
              id="runtime"
              {...form.register("runtime")}
              placeholder="e.g., ubuntu-22.04"
            />
          </div>
        </div>

        <ResourceFields />

        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Ports</div>
          <DevboxPortsFields fieldArray={portsFieldArray} />
        </div>

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
