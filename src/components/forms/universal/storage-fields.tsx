"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { UseFieldArrayReturn, useFormContext } from "react-hook-form";
import { storageSizeOptions } from "@/schemas/forms/universal/storage-schema";

interface StorageFieldsProps {
  fieldArray: UseFieldArrayReturn<any, "storage", "id">;
}

export const StorageFields: React.FC<StorageFieldsProps> = ({
  fieldArray,
}) => {
  const { fields, append, remove } = fieldArray;
  const { register, setValue, watch } = useFormContext();

  const addStorage = () => {
    append({ path: "", size: "1Gi" });
  };

  const removeStorage = (index: number) => {
    remove(index);
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor={`storage.${index}.path`} className="sr-only">
              Path
            </Label>
            <Input
              id={`storage.${index}.path`}
              placeholder="Path (e.g., /data)"
              {...register(`storage.${index}.path`)}
            />
          </div>
          <div className="w-24">
            <Label htmlFor={`storage.${index}.size`} className="sr-only">
              Size
            </Label>
            <Select
              value={watch(`storage.${index}.size`) || "1Gi"}
              onValueChange={(value) =>
                setValue(`storage.${index}.size`, value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {storageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => removeStorage(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addStorage}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Storage Volume
      </Button>
    </div>
  );
};
