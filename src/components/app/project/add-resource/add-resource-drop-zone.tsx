"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Droppable } from "@/components/flow/dnd/droppable";
import { X, Package } from "lucide-react";
import { toast } from "sonner";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import _ from "lodash";

type ResourceTarget = CustomResourceTarget | BuiltinResourceTarget;

export function AddResourceDropZone() {
  const [collectedResources, setCollectedResources] = useState<
    ResourceTarget[]
  >([]);

  const handleDrop = (event: any) => {
    const resourceTarget = _.get(
      event,
      "active.data.current.resourceTarget"
    ) as ResourceTarget;
    if (!resourceTarget) return;

    const id = `${_.get(resourceTarget, "resourceType", "unknown")}-${_.get(
      resourceTarget,
      "name",
      "unknown"
    )}`;

    if (
      _.some(
        collectedResources,
        (r) =>
          `${_.get(r, "resourceType", "unknown")}-${_.get(
            r,
            "name",
            "unknown"
          )}` === id
      )
    ) {
      toast.info("Resource already added to drop zone");
      return;
    }

    setCollectedResources((prev) => [...prev, resourceTarget]);
    toast.success(
      `Added ${_.get(resourceTarget, "name", "unknown")} to drop zone`
    );
  };

  const removeResource = (index: number) => {
    setCollectedResources((prev) => _.filter(prev, (_, i) => i !== index));
  };

  const getResourceDisplayInfo = (resource: ResourceTarget) => ({
    name: _.get(resource, "name", "unknown"),
    type: _.get(resource, "resourceType", "unknown"),
  });

  return (
    <div className="space-y-4">
      <Droppable
        id="resource-drop-zone"
        data={{ onDrop: handleDrop }}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 min-h-[120px] transition-colors"
      >
        {_.isEmpty(collectedResources) ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Package className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Drag resources here to collect them
            </p>
            <p className="text-xs text-muted-foreground/70 text-center mt-1">
              0 resources collected
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mt-0">
            {_.map(collectedResources, (resource, index) => {
              const { name, type } = getResourceDisplayInfo(resource);
              return (
                <div
                  key={`${type}-${name}-${index}`}
                  className="flex items-center gap-2 border rounded-lg p-1 text-xs"
                >
                  <span className="text-xs">{type}: </span>
                  <span className="font-medium">{name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResource(index)}
                    className="h-2 w-2 p-0 hover:bg-destructive/10"
                    aria-label={`Remove ${name}`}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Droppable>
    </div>
  );
}
