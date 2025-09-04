"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useObjectStorageUpdateForm } from "@/hooks/forms/objectstorage/use-objectstorage-update-form";
import { ObjectStorageUpdateFormData } from "@/schemas/forms/objectstorage/objectstorage-update-schema";
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

interface ObjectStorageUpdateFormProps {
  defaultValues?: Partial<ObjectStorageUpdateFormData>;
  onSubmit: (data: ObjectStorageUpdateFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
}

export const ObjectStorageUpdateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
}: ObjectStorageUpdateFormProps) => {
  const { form } = useObjectStorageUpdateForm(defaultValues);

  const handleSubmit = (data: any) => {
    onSubmit(data as ObjectStorageUpdateFormData);
  };

  // Only show fields that have values in defaultValues
  const hasPolicy = defaultValues?.policy !== undefined;

  return (
    <Form {...form}>
      <form id="objectstorage-update-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {hasPolicy && (
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
