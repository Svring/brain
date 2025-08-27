import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { LaunchpadCreateRequest, PortSchema } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import { z } from "zod";

// Port type from the schema
type Port = z.infer<typeof PortSchema>;

interface PortsProtocolProps {
  form: UseFormReturn<LaunchpadCreateRequest>;
}

export function PortsProtocol({ form }: PortsProtocolProps) {
  // Port management functions
  const addPort = () => {
    const currentPorts = form.getValues("ports");
    form.setValue("ports", [
      ...currentPorts,
      {
        port: 8080,
        protocol: "TCP",
        appProtocol: undefined,
        exposesPublicDomain: false,
      },
    ]);
  };

  const removePort = (index: number) => {
    const currentPorts = form.getValues("ports");
    if (currentPorts.length > 1) {
      form.setValue(
        "ports",
        currentPorts.filter((_, i) => i !== index)
      );
    }
  };

  const updatePort = (index: number, field: keyof Port, value: any) => {
    const currentPorts = form.getValues("ports");
    const newPorts = [...currentPorts];
    
    if (field === "protocol") {
      // If selecting TCP or UDP, clear appProtocol
      if (value === "TCP" || value === "UDP") {
        newPorts[index] = { ...newPorts[index], protocol: value, appProtocol: undefined };
      }
    } else if (field === "appProtocol") {
      // If selecting HTTP, GRPC, or WS, set protocol to TCP and set appProtocol
      if (value === "HTTP" || value === "GRPC" || value === "WS") {
        newPorts[index] = { ...newPorts[index], protocol: "TCP", appProtocol: value };
      }
    } else {
      newPorts[index] = { ...newPorts[index], [field]: value };
    }
    
    form.setValue("ports", newPorts);
  };

  return (
    <AccordionItem
      value="ports-protocol"
      className="inset-ring inset-ring-border rounded-lg"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          <span className="font-medium">Ports & Protocol</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        <div className="space-y-3">
          {form.watch("ports")?.map((port, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 border rounded-lg"
            >
              <div className="flex-1 grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Port"
                  value={port.port}
                  onChange={(e) =>
                    updatePort(
                      index,
                      "port",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="col-span-1"
                />
                <Select
                  value={port.appProtocol || port.protocol}
                  onValueChange={(value) =>
                    updatePort(
                      index,
                      value === "HTTP" || value === "GRPC" || value === "WS" ? "appProtocol" : "protocol",
                      value
                    )
                  }
                >
                  <SelectTrigger className="col-span-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TCP">TCP</SelectItem>
                    <SelectItem value="UDP">UDP</SelectItem>
                    <SelectItem value="HTTP">HTTP</SelectItem>
                    <SelectItem value="GRPC">GRPC</SelectItem>
                    <SelectItem value="WS">WS</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={port.exposesPublicDomain.toString()}
                  onValueChange={(value) =>
                    updatePort(
                      index,
                      "exposesPublicDomain",
                      value === "true"
                    )
                  }
                >
                  <SelectTrigger className="col-span-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Public</SelectItem>
                    <SelectItem value="false">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.watch("ports").length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePort(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
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
      </AccordionContent>
    </AccordionItem>
  );
}
