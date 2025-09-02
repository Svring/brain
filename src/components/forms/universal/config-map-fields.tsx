"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { UseFieldArrayReturn, useFormContext } from "react-hook-form";

interface ConfigMapFieldsProps {
  fieldArray: UseFieldArrayReturn<any, "configMap", "id">;
}

export const ConfigMapFields: React.FC<ConfigMapFieldsProps> = ({
  fieldArray,
}) => {
  const { fields, append, remove } = fieldArray;
  const { register } = useFormContext();

  const addConfigMap = () => {
    append({ path: "", value: "" });
  };

  const removeConfigMap = (index: number) => {
    remove(index);
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor={`configMap.${index}.path`} className="sr-only">
              Path
            </Label>
            <Input
              id={`configMap.${index}.path`}
              placeholder="Path (e.g., /etc/config/app.conf)"
              {...register(`configMap.${index}.path`)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor={`configMap.${index}.value`} className="sr-only">
              Value
            </Label>
            <Input
              id={`configMap.${index}.value`}
              placeholder="Value"
              {...register(`configMap.${index}.value`)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => removeConfigMap(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addConfigMap}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Config Map Entry
      </Button>
    </div>
  );
};
