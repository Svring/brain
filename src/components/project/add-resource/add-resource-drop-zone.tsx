"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Droppable } from "@/components/flow/dnd/droppable";
import { Draggable } from "@/components/flow/dnd/draggable";
import { GripVertical } from "lucide-react";
import { X, Package } from "lucide-react";
import { toast } from "sonner";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import _ from "lodash";

type ResourceTarget = CustomResourceTarget | BuiltinResourceTarget;

interface AddResourceDropZoneProps {
  onResourcesAdded?: () => void;
}

export function AddResourceDropZone() {
  const [collectedResources, setCollectedResources] = useState<
    ResourceTarget[]
  >([]);

  const clearResources = () => {
    setCollectedResources([]);
  };

  // Listen for clear event from DndProvider
  useEffect(() => {
    const handleClearResources = () => {
      setCollectedResources([]);
    };

    const element = document.querySelector(
      '[data-drop-zone-id="add-resource-drop-zone"]'
    );
    if (element) {
      element.addEventListener("clearResources", handleClearResources);
      return () => {
        element.removeEventListener("clearResources", handleClearResources);
      };
    }
  }, []);

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

  const InnerZone = (
    <div className="relative">
      <Droppable
        id="resource-drop-zone"
        data={{ onDrop: handleDrop }}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 min-h-[120px] transition-colors"
      >
        {/* Handle shown only when resources present */}
        {collectedResources.length > 0 && (
          <Draggable
            id="add-resource-drop-zone"
            data={{ resources: collectedResources }}
          >
            <div className="absolute -left-2 cursor-grab select-none p-1 bg-background shadow-sm">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          </Draggable>
        )}
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
                  className="flex items-center gap-2 border rounded-md p-1 text-xs"
                >
                  {/* <span className="text-xs">{type}: </span> */}
                  <span className="font-medium">{name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResource(index)}
                    className="h-4 w-4 p-0 hover:bg-destructive/10 flex-shrink-0"
                    aria-label={`Remove ${name}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Droppable>
    </div>
  );

  return <div data-drop-zone-id="add-resource-drop-zone">{InnerZone}</div>;
}
