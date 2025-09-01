"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { Env } from "@/schemas/forms/launchpad/launchpad-create-form-schema";

interface EnvFieldsProps {
  fieldArray: any; // useFieldArray return type
}

export const EnvFields = ({ fieldArray }: EnvFieldsProps) => {
  const form = useFormContext<{ env: Env[] }>();

  const addEnv = () => {
    fieldArray.append({
      name: "",
      value: "",
    });
  };

  const removeEnv = (index: number) => {
    fieldArray.remove(index);
  };

  return (
    <div className="space-y-4 border border-border rounded-lg p-4">
      <div className="space-y-3">
        {fieldArray.fields.map((field: any, index: number) => (
          <div key={field.id} className="flex items-center gap-3 rounded-lg">
            <div className="flex-1 flex items-center gap-3">
              <div className="w-[30%]">
                <Input
                  {...form.register(`env.${index}.name` as const)}
                  placeholder="Variable name"
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <Input
                  {...form.register(`env.${index}.value` as const)}
                  placeholder="Value"
                  className="w-full"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeEnv(index)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addEnv}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Environment Variable
        </Button>
      </div>
    </div>
  );
};
