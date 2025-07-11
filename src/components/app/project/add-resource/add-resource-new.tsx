"use client";

import { CUSTOM_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-custom-resource";
import { BUILTIN_RESOURCES } from "@/lib/k8s/k8s-constant/k8s-constant-builtin-resource";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import React from "react";

// Define the resource options you want to show
const RESOURCE_OPTIONS = [
  {
    key: "devbox",
    label: "DevBox",
    type: "custom",
    config: CUSTOM_RESOURCES.devbox,
  },
  {
    key: "cluster",
    label: "Cluster",
    type: "custom",
    config: CUSTOM_RESOURCES.cluster,
  },
  {
    key: "deployment",
    label: "Deploy",
    type: "builtin",
    config: BUILTIN_RESOURCES.deployment,
  },
  {
    key: "objectstoragebucket",
    label: "Object Storage",
    type: "custom",
    config: CUSTOM_RESOURCES.objectstoragebucket,
  },
];

export function AddResourceNew() {
  return (
    <Accordion type="multiple" className="h-full">
      {RESOURCE_OPTIONS.map((option) => (
        <AccordionItem key={option.key} value={option.key}>
          <AccordionTrigger>{option.label}</AccordionTrigger>
          <AccordionContent>
            {/* Placeholder for resource-specific form or info */}
            <div className="p-4 text-muted-foreground">
              {option.label} creation form will go here.
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default AddResourceNew;
