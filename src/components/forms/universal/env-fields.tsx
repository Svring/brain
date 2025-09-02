"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { Env } from "@/schemas/forms/launchpad/launchpad-create-form-schema";

interface EnvFieldsProps {
  fieldArray: any; // useFieldArray return type
}

export const EnvFields = ({ fieldArray }: EnvFieldsProps) => {
  const form = useFormContext<{ env: Env[] }>();
  const [newEnvType, setNewEnvType] = useState<"value" | "valueFrom">("value");

  const addEnv = () => {
    if (newEnvType === "value") {
      fieldArray.append({
        name: "",
        value: "",
      });
    } else {
      fieldArray.append({
        name: "",
        valueFrom: {
          secretKeyRef: {
            key: "",
            name: "",
          },
        },
      });
    }
  };

  const removeEnv = (index: number) => {
    fieldArray.remove(index);
  };

  const getEnvType = (env: Env) => {
    return env.valueFrom ? "valueFrom" : "value";
  };

  const renderEnvField = (field: any, index: number) => {
    const envType = getEnvType(field);
    
    if (envType === "valueFrom") {
      return (
        <div key={field.id} className="flex items-center gap-3 rounded-lg">
          <div className="flex-1 flex items-center gap-3">
            <div className="w-[25%]">
              <Input
                {...form.register(`env.${index}.name` as const)}
                placeholder="Variable name"
                className="w-full"
              />
            </div>
            <div className="w-[25%]">
              <Input
                {...form.register(`env.${index}.valueFrom.secretKeyRef.name` as const)}
                placeholder="Secret name"
                className="w-full"
              />
            </div>
            <div className="w-[25%]">
              <Input
                {...form.register(`env.${index}.valueFrom.secretKeyRef.key` as const)}
                placeholder="Secret key"
                className="w-full"
              />
            </div>
            <div className="w-[25%]">
              <div className="text-xs text-muted-foreground px-3 py-2 bg-muted rounded-md">
                From Secret
              </div>
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
      );
    }

    return (
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
    );
  };

  return (
    <div className="space-y-4 border border-border rounded-lg p-4">
      <div className="space-y-3">
        {fieldArray.fields.map((field: any, index: number) => 
          renderEnvField(field, index)
        )}
        
        {/* Add new env var section */}
        <div className="flex items-center gap-3 pt-2 border-t">
          <Select value={newEnvType} onValueChange={(value: "value" | "valueFrom") => setNewEnvType(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Direct Value</SelectItem>
              <SelectItem value="valueFrom">From Secret</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            type="button"
            variant="outline"
            onClick={addEnv}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Environment Variable
          </Button>
        </div>
      </div>
    </div>
  );
};
