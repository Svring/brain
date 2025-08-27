import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";

interface ConfigMapProps {
  form: UseFormReturn<LaunchpadCreateRequest>;
}

export function ConfigMap({ form }: ConfigMapProps) {
  return (
    <AccordionItem
      value="configmap"
      className="inset-ring inset-ring-border rounded-lg"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          <span className="font-medium">ConfigMap</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        <div className="space-y-2">
          <FormLabel>ConfigMap Configuration</FormLabel>
          <div className="space-y-2">
            {form.watch("configMap")?.map((config, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                <Input
                  placeholder="Mount path"
                  value={config.path || ""}
                  onChange={(e) => {
                    const newConfigMap = [...(form.getValues("configMap") || [])];
                    newConfigMap[index] = { ...newConfigMap[index], path: e.target.value };
                    form.setValue("configMap", newConfigMap);
                  }}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Configuration value"
                    value={config.value || ""}
                    onChange={(e) => {
                      const newConfigMap = [...(form.getValues("configMap") || [])];
                      newConfigMap[index] = { ...newConfigMap[index], value: e.target.value };
                      form.setValue("configMap", newConfigMap);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newConfigMap = form.getValues("configMap")?.filter((_, i) => i !== index) || [];
                      form.setValue("configMap", newConfigMap);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentConfigMap = form.getValues("configMap") || [];
                form.setValue("configMap", [...currentConfigMap, { path: "", value: "" }]);
              }}
            >
              Add ConfigMap
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
