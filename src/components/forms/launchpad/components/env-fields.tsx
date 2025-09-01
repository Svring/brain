"use client";

import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create/launchpad-create-form-schema";

interface EnvFieldsProps {
  fieldArray: any; // useFieldArray return type
}

export const EnvFields = ({ fieldArray }: EnvFieldsProps) => {
  const form = useFormContext<LaunchpadCreateFormData>();

  const addEnv = () => {
    fieldArray.append({
      name: "",
      value: "",
    });
  };

  const removeEnv = (index: number) => {
    fieldArray.remove(index);
  };

  const updateEnv = (index: number, field: string, value: string) => {
    const newEnv = [...(form.getValues("env") || [])];
    newEnv[index] = { ...newEnv[index], [field]: value };
    form.setValue("env", newEnv);
  };

  return (
    <div className="space-y-2">
      <FormLabel>Environment Variables</FormLabel>
      <div className="space-y-2">
        {fieldArray.fields.map((field: any, index: number) => (
          <div key={field.id} className="flex gap-2">
            <Input
              placeholder="Variable name"
              value={form.watch(`env.${index}.name`) || ""}
              onChange={(e) => updateEnv(index, "name", e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Value"
              value={form.watch(`env.${index}.value`) || ""}
              onChange={(e) => updateEnv(index, "value", e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeEnv(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEnv}
        >
          Add Environment Variable
        </Button>
      </div>
    </div>
  );
};
