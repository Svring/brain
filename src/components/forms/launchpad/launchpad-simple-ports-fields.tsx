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
import { LaunchpadPortSimpleUpdate } from "@/schemas/forms/launchpad/components/launchpad-port-schema";

interface LaunchpadSimplePortsFieldsProps {
  fieldArray: any; // useFieldArray return type
}

export const LaunchpadSimplePortsFields = ({
  fieldArray,
}: LaunchpadSimplePortsFieldsProps) => {
  const form = useFormContext<{ simplePorts: LaunchpadPortSimpleUpdate[] }>();

  // Watch the entire ports array to force re-renders when any port changes
  const ports = form.watch("simplePorts");

  // Port management functions
  const addPort = () => {
    // Find the next available port number starting from 80
    const existingNumbers =
      ports?.map((port) => port.number).filter((num) => num !== undefined) ||
      [];
    let nextPortNumber = 80;

    // Find the first available port number
    while (existingNumbers.includes(nextPortNumber)) {
      nextPortNumber++;
    }

    fieldArray.append({
      operation: "create",
      number: nextPortNumber,
      protocol: "HTTP",
      exposesPublicDomain: true,
    });
  };

  const removePort = (index: number) => {
    fieldArray.remove(index);
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case "create":
        return "text-green-600 bg-green-50 border-green-200";
      case "update":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "delete":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-2 border border-border rounded-lg p-4">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
        <div>Operation</div>
        <div>Number</div>
        <div>Protocol</div>
        <div>Public</div>
        <div>Action</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-0 py-0">
        {fieldArray.fields.map((field: any, index: number) => {
          const portData = ports?.[index];
          const operation = portData?.operation;
          const portValue = portData?.number;
          const exposesPublicDomain = portData?.exposesPublicDomain;
          const protocol = portData?.protocol;

          return (
            <div key={field.id} className="grid grid-cols-5 gap-4 items-center">
              {/* Operation Column */}
              <div>
                <Select
                  value={operation || "create"}
                  onValueChange={(value) => {
                    form.setValue(
                      `simplePorts.${index}.operation` as const,
                      value as "create" | "update" | "delete"
                    );
                    // Reset fields when changing operation
                    if (value === "delete") {
                      form.setValue(
                        `simplePorts.${index}.protocol` as const,
                        undefined
                      );
                      form.setValue(
                        `simplePorts.${index}.exposesPublicDomain` as const,
                        undefined
                      );
                    } else if (value === "create") {
                      form.setValue(
                        `simplePorts.${index}.protocol` as const,
                        "HTTP"
                      );
                      form.setValue(
                        `simplePorts.${index}.exposesPublicDomain` as const,
                        true
                      );
                    }
                  }}
                >
                  <SelectTrigger
                    className={`w-full border-none shadow-none focus:ring-0 text-xs ${getOperationColor(
                      operation || "create"
                    )}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background-secondary">
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number Column */}
              <div>
                <Input
                  {...form.register(`simplePorts.${index}.number` as const, {
                    setValueAs: (value) => {
                      const num = parseInt(value, 10);
                      return isNaN(num) ? 80 : num;
                    },
                    validate: (value) => {
                      if (!value) return "Port number is required";

                      const num = parseInt(value.toString(), 10);
                      if (isNaN(num)) return "Invalid port number";

                      // Check for duplicates (excluding current port)
                      const otherPorts =
                        ports?.filter((_, i) => i !== index) || [];
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

              {/* Protocol Column */}
              <div>
                {operation === "delete" ? (
                  <span className="text-sm text-muted-foreground">-</span>
                ) : (
                  <Select
                    value={protocol || (operation === "create" ? "HTTP" : "")}
                    onValueChange={(value) => {
                      form.setValue(
                        `simplePorts.${index}.protocol` as const,
                        value as "HTTP" | "GRPC" | "WS"
                      );
                    }}
                    disabled={!operation}
                  >
                    <SelectTrigger className="w-full border-none shadow-none focus:ring-0 bg-transparent! pl-0">
                      <SelectValue
                        placeholder={
                          operation === "update" ? "No change" : "Select"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-background-secondary">
                      <SelectItem value="HTTP">HTTP</SelectItem>
                      <SelectItem value="GRPC">GRPC</SelectItem>
                      <SelectItem value="WS">WS</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Public Column */}
              <div className="flex items-center gap-2">
                {operation === "delete" ? (
                  <span className="text-sm text-muted-foreground">-</span>
                ) : (
                  <>
                    <Checkbox
                      checked={exposesPublicDomain || false}
                      onCheckedChange={(checked) => {
                        form.setValue(
                          `simplePorts.${index}.exposesPublicDomain` as const,
                          checked === true
                        );
                      }}
                      disabled={!operation}
                    />
                    <span className="text-sm text-muted-foreground">
                      Public
                    </span>
                  </>
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
        Add Port Operation
      </Button>
    </div>
  );
};
