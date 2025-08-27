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
import { ChevronDown } from "lucide-react";
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import { storageSizeOptions } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";

interface StorageProps {
  form: UseFormReturn<LaunchpadCreateRequest>;
  defaultOpen?: boolean;
}

export function Storage({ form, defaultOpen = false }: StorageProps) {
  return (
    <AccordionItem
      value="storage"
      className="inset-ring inset-ring-border rounded-lg"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4" />
          <span className="font-medium">Storage</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        <div className="space-y-2">
          <FormLabel>Storage Configuration</FormLabel>
          <div className="space-y-2">
            {form.watch("storage")?.map((storage, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-2 p-3 border rounded-lg"
              >
                <Input
                  placeholder="Storage name"
                  value={storage.name || ""}
                  onChange={(e) => {
                    const newStorage = [...(form.getValues("storage") || [])];
                    newStorage[index] = {
                      ...newStorage[index],
                      name: e.target.value,
                    };
                    form.setValue("storage", newStorage);
                  }}
                />
                <Input
                  placeholder="Mount path"
                  value={storage.path || ""}
                  onChange={(e) => {
                    const newStorage = [...(form.getValues("storage") || [])];
                    newStorage[index] = {
                      ...newStorage[index],
                      path: e.target.value,
                    };
                    form.setValue("storage", newStorage);
                  }}
                />
                <div className="flex gap-2">
                  <Select
                    value={storage.size || "1Gi"}
                    onValueChange={(value) => {
                      const newStorage = [...(form.getValues("storage") || [])];
                      newStorage[index] = {
                        ...newStorage[index],
                        size: value as (typeof storageSizeOptions)[number],
                      };
                      form.setValue("storage", newStorage);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageSizeOptions.map((sizeValue) => (
                        <SelectItem key={sizeValue} value={sizeValue}>
                          {sizeValue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newStorage =
                        form
                          .getValues("storage")
                          ?.filter((_, i) => i !== index) || [];
                      form.setValue("storage", newStorage);
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
                const currentStorage = form.getValues("storage") || [];
                form.setValue("storage", [
                  ...currentStorage,
                  { name: "", path: "", size: "1Gi" },
                ]);
              }}
            >
              Add Storage
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
