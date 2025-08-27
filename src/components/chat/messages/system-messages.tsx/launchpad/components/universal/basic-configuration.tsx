import React from "react";
import { UseFormReturn } from "react-hook-form";
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import { NameConfiguration } from "./name-configuration";
import { ImageConfiguration } from "./image-configuration";
import { ResourceConfiguration } from "./resource-configuration";

interface BasicConfigurationProps {
  form: UseFormReturn<LaunchpadCreateRequest>;
}

export function BasicConfiguration({ form }: BasicConfigurationProps) {
  return (
    <div className="space-y-4">
      <NameConfiguration form={form} />
      <ImageConfiguration form={form} />
      <ResourceConfiguration form={form} />
    </div>
  );
}
