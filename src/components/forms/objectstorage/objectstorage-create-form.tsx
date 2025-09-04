"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useObjectStorageCreateForm } from "@/hooks/forms/objectstorage/use-objectstorage-create-form";
import { ObjectStorageCreateFormData } from "@/schemas/forms/objectstorage/objectstorage-create-form-schema";
import { NameField } from "@/components/forms/universal/name-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ObjectStorageCreateFormProps {
  defaultValues?: Partial<ObjectStorageCreateFormData>;
  onSubmit: (data: ObjectStorageCreateFormData) => void;
  isLoading?: boolean;
}

export const ObjectStorageCreateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
}: ObjectStorageCreateFormProps) => {
  const { form } = useObjectStorageCreateForm(defaultValues);

  const handleSubmit = (data: any) => {
    onSubmit(data as ObjectStorageCreateFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <NameField />

          <FormField
            control={form.control}
            name="policy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Policy</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select access policy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="publicRead">Public Read</SelectItem>
                    <SelectItem value="publicReadWrite">Public Read/Write</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
