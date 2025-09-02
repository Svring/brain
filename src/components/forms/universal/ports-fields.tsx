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
import { Port } from "@/schemas/forms/launchpad/launchpad-create-form-schema";

interface PortsFieldsProps {
  fieldArray: any; // useFieldArray return type
}

export const PortsFields = ({ fieldArray }: PortsFieldsProps) => {
  const form = useFormContext<{ ports: Port[] }>();

  // Watch the entire ports array to force re-renders when any port changes
  const ports = form.watch("ports");

  // Port management functions
  const addPort = () => {
    fieldArray.append({
      port: 8080,
      protocol: "TCP",
      appProtocol: undefined,
      exposesPublicDomain: false,
    });
  };

  const removePort = (index: number) => {
    fieldArray.remove(index);
  };

  // Get display value for the unified select
  const getProtocolDisplayValue = (port: any) => {
    if (port?.appProtocol) {
      return port.appProtocol;
    }
    return port?.protocol || "TCP";
  };

  return (
    <div className="space-y-4 border border-border rounded-lg p-4">
      <div className="space-y-3">
        {fieldArray.fields.map((field: any, index: number) => {
          const portData = ports?.[index];
          const portValue = portData?.port;
          const exposesPublic = portData?.exposesPublicDomain;
          const currentProtocol = getProtocolDisplayValue(portData);

          return (
            <div key={field.id} className="flex items-center gap-3 rounded-lg">
              <div className="flex-1 flex items-center gap-3">
                <div className="w-[15%]">
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
                <div className="w-[25%] flex items-center gap-2">
                  <Checkbox
                    checked={exposesPublic || false}
                    onCheckedChange={(checked) => {
                      form.setValue(
                        `ports.${index}.exposesPublicDomain` as const,
                        checked === true
                      );
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Public access
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-between">
                  {exposesPublic ? (
                    <Select
                      value={currentProtocol}
                      onValueChange={(value) => {
                        // Handle protocol selection
                        switch (value) {
                          case "TCP":
                            form.setValue(
                              `ports.${index}.protocol` as const,
                              "TCP"
                            );
                            form.setValue(
                              `ports.${index}.appProtocol` as const,
                              undefined
                            );
                            break;
                          case "UDP":
                            form.setValue(
                              `ports.${index}.protocol` as const,
                              "UDP"
                            );
                            form.setValue(
                              `ports.${index}.appProtocol` as const,
                              undefined
                            );
                            break;
                          case "SCTP":
                            form.setValue(
                              `ports.${index}.protocol` as const,
                              "SCTP"
                            );
                            form.setValue(
                              `ports.${index}.appProtocol` as const,
                              undefined
                            );
                            break;
                          case "HTTP":
                            form.setValue(
                              `ports.${index}.protocol` as const,
                              "TCP"
                            );
                            form.setValue(
                              `ports.${index}.appProtocol` as const,
                              "HTTP"
                            );
                            break;
                          case "GRPC":
                            form.setValue(
                              `ports.${index}.protocol` as const,
                              "TCP"
                            );
                            form.setValue(
                              `ports.${index}.appProtocol` as const,
                              "GRPC"
                            );
                            break;
                          case "WS":
                            form.setValue(
                              `ports.${index}.protocol` as const,
                              "TCP"
                            );
                            form.setValue(
                              `ports.${index}.appProtocol` as const,
                              "WS"
                            );
                            break;
                        }
                      }}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TCP">TCP</SelectItem>
                        <SelectItem value="UDP">UDP</SelectItem>
                        <SelectItem value="SCTP">SCTP</SelectItem>
                        <SelectItem value="HTTP">HTTP</SelectItem>
                        <SelectItem value="GRPC">GRPC</SelectItem>
                        <SelectItem value="WS">WS</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePort(index)}
                    className="text-destructive hover:text-destructive ml-2"
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
