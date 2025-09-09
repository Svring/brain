"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useLaunchpadCreateForm } from "@/hooks/forms/launchpad/use-launchpad-create-form";
import { LaunchpadCreateFormData } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { NameField } from "@/components/forms/universal/name-field";
import { ImageField } from "@/components/forms/universal/image-field";
import { ResourceFields } from "../universal/resource-fields";
import { LaunchpadPortsFields } from "./launchpad-ports-fields";
import { EnvFields } from "../universal/env-fields";
import {
  CommandField,
  ArgsField,
} from "@/components/forms/universal/command-args-fields";
import { ConfigMapFields } from "../universal/config-map-fields";
import { StorageFields } from "../universal/storage-fields";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface LaunchpadCreateFormProps {
  defaultValues?: Partial<LaunchpadCreateFormData>;
  onSubmit: (data: LaunchpadCreateFormData) => void;
  isLoading?: boolean;
  hideDefaultButton?: boolean;
}

export const LaunchpadCreateForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  hideDefaultButton = false,
}: LaunchpadCreateFormProps) => {
  const { form, portsFieldArray, envFieldArray, storageFieldArray, configMapFieldArray } =
    useLaunchpadCreateForm(defaultValues);
  
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

  const handleSubmit = (data: any) => {
    onSubmit(data as LaunchpadCreateFormData);
  };

  return (
    <Form {...form}>
      <form id="launchpad-create-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Configuration */}
        <div className="space-y-4">
          <NameField />
          <ImageField />
        </div>

        {/* Ports Configuration */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Ports</div>
          <LaunchpadPortsFields fieldArray={portsFieldArray} />
        </div>

        {/* Resource Configuration */}
        <div className="border border-dashed rounded-lg">
          <div className="flex items-center justify-between p-2 border-b border-dashed">
            <h3 className="font-medium">Resource Configuration</h3>
          </div>
          <div className="p-4">
            <ResourceFields />
          </div>
        </div>

        {/* Advanced Configuration */}
        <div className="border border-dashed rounded-lg">
          <div 
            className="flex items-center justify-between p-2 border-b border-dashed cursor-pointer transition-colors"
            onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
            title="Click to toggle advanced configuration"
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 flex items-center justify-center">
                {isAdvancedExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
              <h3 className="font-medium">Advanced Configuration</h3>
            </div>
          </div>

          {isAdvancedExpanded && (
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CommandField />
                <ArgsField />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  Environment Variables
                </div>
                <EnvFields fieldArray={envFieldArray} />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  Config Map
                </div>
                <ConfigMapFields fieldArray={configMapFieldArray} />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  Storage Volumes
                </div>
                <StorageFields fieldArray={storageFieldArray} />
              </div>
            </div>
          )}
        </div>

        {!hideDefaultButton && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
