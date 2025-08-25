import React from "react";
import { Control, UseFieldArrayReturn } from "react-hook-form";
import { Database, Plus, X, ChevronDown } from "lucide-react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { LaunchpadUpdateFormValues } from "./types";

interface EnvSectionProps {
  control: Control<LaunchpadUpdateFormValues>;
  envFields: UseFieldArrayReturn<LaunchpadUpdateFormValues, "env", "id">;
}

export function EnvSection({ control, envFields }: EnvSectionProps) {
  const handleAddEnv = () => {
    envFields.append({
      name: `ENV_${envFields.fields.length + 1}`,
      value: "",
    });
  };

  return (
    <AccordionItem value="env" className="inset-ring inset-ring-border rounded-lg">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          <Database className="h-4 w-4" />
          <span className="font-medium">Environment Variables ({envFields.fields.length})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        <div className="space-y-3">
          {envFields.fields.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No environment variables configured
            </div>
          ) : (
            envFields.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <FormField
                    control={control}
                    name={`env.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="VARIABLE_NAME" className="h-8" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`env.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="variable_value" className="h-8" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => envFields.remove(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
          <Button type="button" variant="outline" onClick={handleAddEnv} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Environment Variable
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
