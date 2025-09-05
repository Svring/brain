"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { DevboxCreateFormData } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { DEVBOX_RUNTIMES, DevboxRuntime } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";
import { useEffect } from "react";

export const DevboxRuntimeField = () => {
  const { setValue, watch } = useFormContext<DevboxCreateFormData>();
  const selectedRuntime = watch("runtime");

  // Auto-select the first runtime when no runtime is selected
  useEffect(() => {
    if (!selectedRuntime && DEVBOX_RUNTIMES.length > 0) {
      setValue("runtime", DEVBOX_RUNTIMES[0]);
    }
  }, [selectedRuntime, setValue]);

  return (
    <div className="space-y-2">
      <Label htmlFor="runtime">Runtime</Label>
      <Select value={selectedRuntime} onValueChange={(value) => setValue("runtime", value as DevboxRuntime)}>
        <SelectTrigger>
          <SelectValue placeholder="Select runtime" />
        </SelectTrigger>
        <SelectContent>
          {DEVBOX_RUNTIMES.map((runtime) => (
            <SelectItem key={runtime} value={runtime}>
              {runtime}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
