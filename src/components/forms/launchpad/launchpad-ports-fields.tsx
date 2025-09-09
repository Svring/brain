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
import { LaunchpadPort } from "@/schemas/forms/launchpad/components/launchpad-port-schema";

interface LaunchpadPortsFieldsProps {
  fieldArray: any; // useFieldArray return type
}

export const LaunchpadPortsFields = ({ fieldArray }: LaunchpadPortsFieldsProps) => {
  const form = useFormContext<{ ports: LaunchpadPort[] }>();

  // Watch the entire ports array to force re-renders when any port changes
  const ports = form.watch("ports");

  // Port management functions
  const addPort = () => {
    // Find the next available port number starting from 80
    const existingNumbers = ports
      .map((port) => port.number)
      .filter((num) => num !== undefined);
    let nextPortNumber = 80;

    // Find the first available port number
    while (existingNumbers.includes(nextPortNumber)) {
      nextPortNumber++;
    }

    // New ports should NOT have portName field (backend will know it's new)
    fieldArray.append({
      number: nextPortNumber,
      protocol: "HTTP",
      exposesPublicDomain: true,
      // No portName field for new ports
    });
  };

  const removePort = (index: number) => {
    // Removing a port from the array means it won't be included in the PUT request
    // Backend will know to delete ports that are not in the submitted array
    fieldArray.remove(index);
  };

  return (
    <div className="space-y-2 border border-border rounded-lg p-4">
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
        <div>Number</div>
        <div>Public</div>
        <div>Protocol</div>
        <div>Action</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-0 py-0">
        {fieldArray.fields.map((field: any, index: number) => {
          const portData = ports?.[index];
          const portValue = portData?.number;
          const exposesPublicDomain = portData?.exposesPublicDomain;
          const protocol = portData?.protocol;

          return (
            <div key={field.id} className="grid grid-cols-4 gap-4 items-center">
              {/* Number Column */}
              <div>
                <Input
                  {...form.register(`ports.${index}.number` as const, {
                    setValueAs: (value) => {
                      const num = parseInt(value, 10);
                      return isNaN(num) ? 80 : num;
                    },
                    validate: (value) => {
                      if (!value) return "Port number is required";

                      const num = parseInt(value.toString(), 10);
                      if (isNaN(num)) return "Invalid port number";

                      // Check for duplicates (excluding current port)
                      const otherPorts = ports.filter((_, i) => i !== index);
                      const isDuplicate = otherPorts.some(
                        (port) => port.number === num
                      );

                      if (isDuplicate) {
                        return "Port number already exists";
                      }

                      return true;
                    },
                  })}
                  type="text"
                  placeholder="80"
                  className="w-full border-none shadow-none focus-visible:ring-0 bg-transparent! pl-0"
                  defaultValue={portValue || 80}
                />
              </div>

              {/* Public Column */}
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={exposesPublicDomain || false}
                  onCheckedChange={(checked) => {
                    form.setValue(
                      `ports.${index}.exposesPublicDomain` as const,
                      checked === true
                    );
                    if (checked) {
                      // Auto-select HTTP when public access is enabled
                      form.setValue(`ports.${index}.protocol` as const, "HTTP");
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

              {/* Protocol Column */}
              <div>
                {exposesPublicDomain ? (
                  <Select
                    value={protocol || "HTTP"}
                    onValueChange={(value) => {
                      form.setValue(
                        `ports.${index}.protocol` as const,
                        value as "HTTP" | "GRPC" | "WS"
                      );
                    }}
                  >
                    <SelectTrigger className="w-full border-none shadow-none focus:ring-0 bg-transparent! pl-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background-secondary">
                      <SelectItem value="HTTP">HTTP</SelectItem>
                      <SelectItem value="GRPC">GRPC</SelectItem>
                      <SelectItem value="WS">WS</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>

              {/* Action Column */}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePort(index)}
                  className="text-destructive hover:text-destructive border-none bg-transparent shadow-none hover:bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Port Button */}
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
  );
};