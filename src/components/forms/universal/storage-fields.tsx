"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { UseFieldArrayReturn, useFormContext } from "react-hook-form";
import { storageSizeOptions } from "@/schemas/forms/universal/storage-schema";
import { useEffect } from "react";

interface StorageFieldsProps {
  fieldArray: UseFieldArrayReturn<any, "storage", "id">;
}

export const StorageFields: React.FC<StorageFieldsProps> = ({
  fieldArray,
}) => {
  const { fields, append, remove } = fieldArray;
  const { register, setValue, watch, unregister } = useFormContext();

  // Watch storage array and clean up when empty
  const storageArray = watch("storage");
  
  useEffect(() => {
    if (storageArray && Array.isArray(storageArray) && storageArray.length === 0) {
      unregister("storage");
    }
  }, [storageArray, unregister]);

  const addStorage = () => {
    append({ path: "", size: "1Gi" });
  };

  const removeStorage = (index: number) => {
    remove(index);
  };

  return (
    <div className="space-y-2 border border-border rounded-lg p-4">
      {/* Table Header - only show when there are items */}
      {fields.length > 0 && (
        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
          <div>Path</div>
          <div>Size</div>
          <div></div>
        </div>
      )}

      {/* Table Rows */}
      <div className="space-y-0 py-0">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-3 gap-4 items-center">
            {/* Path Column */}
            <div>
              <Input
                placeholder="Path (e.g., /data)"
                {...register(`storage.${index}.path`)}
                className="w-full border-none shadow-none focus-visible:ring-0 bg-transparent! pl-0"
              />
            </div>

            {/* Size Column */}
            <div>
              <Select
                value={watch(`storage.${index}.size`) || "1Gi"}
                onValueChange={(value) =>
                  setValue(`storage.${index}.size`, value)
                }
              >
                <SelectTrigger className="w-full border-none shadow-none focus:ring-0 bg-transparent! pl-0">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent className="bg-background-secondary">
                  {storageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delete Button Column */}
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStorage(index)}
                className="text-destructive hover:text-destructive border-none bg-transparent shadow-none hover:bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Storage Button */}
      <Button
        type="button"
        variant="outline"
        onClick={addStorage}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Storage Volume
      </Button>
    </div>
  );
};
