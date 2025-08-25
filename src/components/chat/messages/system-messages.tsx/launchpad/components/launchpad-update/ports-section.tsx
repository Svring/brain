import React from "react";
import { Control, UseFieldArrayReturn } from "react-hook-form";
import { Network, Plus, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { LaunchpadUpdateFormValues } from "./types";

interface PortsSectionProps {
  control: Control<LaunchpadUpdateFormValues>;
  portFields: UseFieldArrayReturn<LaunchpadUpdateFormValues, "ports", "id">;
}

export function PortsSection({ control, portFields }: PortsSectionProps) {
  const handleAddPort = () => {
    portFields.append({
      port: 8080,
      protocol: "TCP",
      appProtocol: "HTTP",
      exposesPublicDomain: true,
    });
  };

  return (
    <AccordionItem value="ports" className="inset-ring inset-ring-border rounded-lg">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          <Network className="h-4 w-4" />
          <span className="font-medium">Ports ({portFields.fields.length})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        <div className="space-y-3">
          {portFields.fields.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No ports configured
            </div>
          ) : (
            portFields.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <FormField
                    control={control}
                    name={`ports.${index}.port`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-8"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`ports.${index}.protocol`}
                    render={({ field }) => (
                      <FormItem>
                        <Select 
                          onValueChange={(value) => {
                            if (value === "HTTP" || value === "GRPC" || value === "WS") {
                              // Set protocol to TCP and appProtocol to the selected value
                              field.onChange("TCP");
                              // Note: We would need access to form setValue here for appProtocol
                              // This will be handled by the parent component's logic
                            } else {
                              field.onChange(value);
                            }
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TCP">TCP</SelectItem>
                            <SelectItem value="UDP">UDP</SelectItem>
                            <SelectItem value="HTTP">HTTP</SelectItem>
                            <SelectItem value="GRPC">GRPC</SelectItem>
                            <SelectItem value="WS">WS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`ports.${index}.exposesPublicDomain`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <Label className="text-xs">Public Domain</Label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => portFields.remove(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
          <Button type="button" variant="outline" onClick={handleAddPort} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Port
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
