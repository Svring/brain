import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import {
  DevboxCreate,
  DevboxPort,
} from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-mutation-schema";

interface PortsProtocolProps {
  form: UseFormReturn<DevboxCreate>;
}

export function PortsProtocol({ form }: PortsProtocolProps) {
  // Port management functions
  const addPort = () => {
    const currentPorts = form.getValues("ports");
    form.setValue("ports", [
      ...currentPorts,
      {
        number: 8080,
        protocol: "HTTPS",
        public: false,
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

  const updatePort = (index: number, field: keyof DevboxPort, value: any) => {
    const currentPorts = form.getValues("ports");
    const newPorts = [...currentPorts];
    newPorts[index] = { ...newPorts[index], [field]: value };
    form.setValue("ports", newPorts);
  };

  return (
    <div className="space-y-4 border border-border rounded-lg p-4">
      <div className="space-y-3">
        {form.watch("ports")?.map((port, index) => (
          <div key={index} className="flex items-center gap-3 rounded-lg">
            <div className="flex-1 flex items-center gap-3">
              <div className="">
                <Input
                  type="number"
                  placeholder="Port number"
                  value={port.number}
                  onChange={(e) =>
                    updatePort(index, "number", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={port.public}
                  onCheckedChange={(checked) =>
                    updatePort(index, "public", checked)
                  }
                />
                <span className="text-sm text-muted-foreground">
                  Public access
                </span>
              </div>
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
    </div>
  );
}
