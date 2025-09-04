"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { DevboxPort } from "@/schemas/forms/devbox/devbox-create-form-schema";

interface DevboxPortsFieldsProps {
  fieldArray: any; // useFieldArray return type
}

export const DevboxPortsFields = ({ fieldArray }: DevboxPortsFieldsProps) => {
  const form = useFormContext<{ ports: DevboxPort[] }>();

  // Watch the entire ports array to force re-renders when any port changes
  const ports = form.watch("ports");

  // Port management functions
  const addPort = () => {
    fieldArray.append({
      port: 8080,
      protocol: "HTTP",
      openPublicDomain: true,
    });
  };

  const removePort = (index: number) => {
    fieldArray.remove(index);
  };

  return (
    <div className="space-y-4 border border-border rounded-lg p-4">
      <div className="space-y-3">
        {fieldArray.fields.map((field: any, index: number) => {
          const portData = ports?.[index];
          const portValue = portData?.port;
          const openPublicDomain = portData?.openPublicDomain;
          const protocol = portData?.protocol;

          return (
            <div key={field.id} className="flex items-center gap-3 rounded-lg">
              <div className="flex-1 flex items-center gap-3">
                <div className="w-[20%]">
                  <Input
                    {...form.register(`ports.${index}.port` as const, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    placeholder="8080"
                    className="w-full"
                    defaultValue={portValue || 8080}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={openPublicDomain || false}
                    onCheckedChange={(checked) => {
                      form.setValue(
                        `ports.${index}.openPublicDomain` as const,
                        checked === true
                      );
                      if (checked) {
                        // Auto-select HTTP when public access is enabled
                        form.setValue(
                          `ports.${index}.protocol` as const,
                          "HTTP"
                        );
                      } else {
                        // Clear protocol when public access is disabled
                        form.setValue(
                          `ports.${index}.protocol` as const,
                          undefined
                        );
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">Public</span>
                </div>
                {openPublicDomain && (
                  <div className="w-[25%]">
                    <Select
                      value={protocol || "HTTP"}
                      onValueChange={(value) => {
                        form.setValue(
                          `ports.${index}.protocol` as const,
                          value as "HTTP" | "GRPC" | "WS"
                        );
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HTTP">HTTP</SelectItem>
                        <SelectItem value="GRPC">GRPC</SelectItem>
                        <SelectItem value="WS">WS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePort(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          onClick={addPort}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Port
        </Button>
      </div>
    </div>
  );
};
