"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { ClusterCreateFormData } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { useEffect } from "react";

const TERMINATION_POLICIES = ["Delete", "WipeOut"] as const;

export const ClusterTerminationPolicyField = () => {
  const { setValue, watch } = useFormContext<ClusterCreateFormData>();
  const selectedPolicy = watch("terminationPolicy");

  // Auto-select "Delete" when no policy is selected
  useEffect(() => {
    if (!selectedPolicy) {
      setValue("terminationPolicy", "Delete");
    }
  }, [selectedPolicy, setValue]);

  return (
    <div className="space-y-2">
      <Label htmlFor="terminationPolicy">Termination Policy</Label>
      <Select
        value={selectedPolicy}
        onValueChange={(value) =>
          setValue("terminationPolicy", value as "Delete" | "WipeOut")
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select termination policy" />
        </SelectTrigger>
        <SelectContent>
          {TERMINATION_POLICIES.map((policy) => (
            <SelectItem key={policy} value={policy}>
              {policy}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
