"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { Env } from "@/schemas/forms/launchpad/launchpad-create-form-schema";

interface EnvFieldsProps {
  fieldArray: any; // useFieldArray return type
}

export const EnvFields = ({ fieldArray }: EnvFieldsProps) => {
  const form = useFormContext<{ env: Env[] }>();

  // Watch the entire env array to force re-renders when any env var changes
  const envVars = form.watch("env");

  const addEnv = () => {
    // Only allow adding direct value env vars (not valueFrom)
    fieldArray.append({
      name: "",
      value: "",
    });
  };

  const removeEnv = (index: number) => {
    fieldArray.remove(index);
  };

  const getEnvType = (env: Env) => {
    return env.valueFrom ? "valueFrom" : "value";
  };

  const isValueFromEnv = (env: Env) => {
    return !!env.valueFrom;
  };

  return (
    <div className="space-y-2 border border-border rounded-lg p-4">
      {/* Table Header - only show when there are items */}
      {fieldArray.fields.length > 0 && (
        <div className="grid grid-cols-2 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
          <div>Name</div>
          <div>Value</div>
        </div>
      )}

      {/* Table Rows */}
      <div className="space-y-0 py-0">
        {fieldArray.fields.map((field: any, index: number) => {
          const envData = envVars?.[index];
          const isValueFrom = isValueFromEnv(envData || {});

          return (
            <div key={field.id} className="flex items-center gap-4">
              {/* Name Column */}
              <div className="flex-1">
                {isValueFrom ? (
                  <div
                    className="text-sm font-medium text-muted-foreground truncate"
                    title={envData?.name || "N/A"}
                  >
                    {envData?.name || "N/A"}
                  </div>
                ) : (
                  <Input
                    {...form.register(`env.${index}.name` as const)}
                    placeholder="Variable name"
                    className="w-full border-none shadow-none focus-visible:ring-0 bg-transparent! pl-0"
                  />
                )}
              </div>

              {/* Value Column */}
              <div className="flex-1">
                {isValueFrom ? (
                  <div className="text-sm text-muted-foreground">
                    from secret
                  </div>
                ) : (
                  <Input
                    {...form.register(`env.${index}.value` as const)}
                    placeholder="Value"
                    className="w-full border-none shadow-none focus-visible:ring-0 bg-transparent! pl-0"
                  />
                )}
              </div>

              {/* Delete Button */}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEnv(index)}
                  className="text-destructive hover:text-destructive border-none bg-transparent shadow-none hover:bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Environment Variable Button */}
      <div className="flex items-center gap-3 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={addEnv}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Environment Variable (Direct Value)
        </Button>
      </div>
    </div>
  );
};
