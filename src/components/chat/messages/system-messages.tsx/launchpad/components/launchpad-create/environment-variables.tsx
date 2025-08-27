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

interface EnvironmentVariablesProps {
  form: UseFormReturn<LaunchpadCreateRequest>;
}

export function EnvironmentVariables({ form }: EnvironmentVariablesProps) {
  return (
    <AccordionItem
      value="env-vars"
      className="inset-ring inset-ring-border rounded-lg"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          <span className="font-medium">Environment Variables</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        <div className="space-y-2">
          <FormLabel>Environment Variables</FormLabel>
          <div className="space-y-2">
            {form.watch("env")?.map((env, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Variable name"
                  value={env.name || ""}
                  onChange={(e) => {
                    const newEnv = [...(form.getValues("env") || [])];
                    newEnv[index] = { ...newEnv[index], name: e.target.value };
                    form.setValue("env", newEnv);
                  }}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={env.value || ""}
                  onChange={(e) => {
                    const newEnv = [...(form.getValues("env") || [])];
                    newEnv[index] = { ...newEnv[index], value: e.target.value };
                    form.setValue("env", newEnv);
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newEnv = form.getValues("env")?.filter((_, i) => i !== index) || [];
                    form.setValue("env", newEnv);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentEnv = form.getValues("env") || [];
                form.setValue("env", [...currentEnv, { name: "", value: "" }]);
              }}
            >
              Add Environment Variable
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
