"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Package, Database, Rocket, HardDrive } from "lucide-react";
import { useAppendMessagesMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

export default function AddResourceMessage() {
  const { mutate: appendMessages } = useAppendMessagesMutation();

  const resources = [
    {
      name: "Devbox",
      icon: Package,
      type: "devbox",
    },
    {
      name: "Database",
      icon: Database,
      type: "cluster",
    },
    {
      name: "Launchpad",
      icon: Rocket,
      type: "launchpad",
    },
    {
      name: "Object Storage",
      icon: HardDrive,
      type: "objectstorage",
    },
  ];

  const handleResourceClick = (resourceType: string) => {
    appendMessages([
      {
        role: "system",
        content: {
          type: `${resourceType}.create`,
          payload: {},
        },
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border border-border-primary rounded-lg">
      <h3 className="text-lg font-semibold">Add Resource</h3>
      <div className="grid grid-cols-2 gap-3">
        {resources.map((resource) => {
          const IconComponent = resource.icon;
          return (
            <Button
              key={resource.type}
              variant="outline"
              className={`h-20 flex flex-col gap-2 border border-border-primary`}
              onClick={() => handleResourceClick(resource.type)}
            >
              <IconComponent className="h-6 w-6" />
              <span className="text-sm font-medium">{resource.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
