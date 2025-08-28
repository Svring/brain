"use client";

import {
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Database,
  Server,
  Globe,
  Cpu,
  Box,
  Rocket,
  HardDrive,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import DevboxCreateMessage from "@/components/chat/messages/system-messages.tsx/devbox/devbox-create-message";
import LaunchpadCreateMessage from "@/components/chat/messages/system-messages.tsx/launchpad/launchpad-create-message";
import ClusterCreateMessage from "@/components/chat/messages/system-messages.tsx/cluster/cluster-create-message";
import ObjectStorageCreateMessage from "@/components/chat/messages/system-messages.tsx/objectstorage/objectstorage-create-message";

interface CommandPanelAddResourceProps {
  onSelect: (value: string) => void;
  onHover?: (value: string | null) => void;
}

// Resource preview component for the detail panel
export function AddResourcePreview({
  onSelect,
  autoFocus = false,
}: {
  onSelect: (value: string) => void;
  autoFocus?: boolean;
}) {
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  useEffect(() => {
    if (autoFocus && itemsRef.current[0]) {
      itemsRef.current[0]?.focus();
    }
  }, [autoFocus]);

  const resourceTypes = useMemo(
    () => [
      {
        id: "add-devbox",
        title: "Devbox",
        description: "Development environment container",
        iconUrl: "https://devbox.bja.sealos.run/logo.svg",
        resourceType: "devbox",
      },
      {
        id: "add-database",
        title: "Database",
        description: "Managed database service",
        iconUrl: "https://dbprovider.bja.sealos.run/logo.svg",
        resourceType: "cluster",
      },
      {
        id: "add-app-launchpad",
        title: "App Launchpad",
        description: "Application deployment platform",
        iconUrl: "https://applaunchpad.bja.sealos.run/logo.svg",
        resourceType: "deployment",
      },
      {
        id: "add-object-storage",
        title: "Object Storage",
        description: "Cloud object storage service",
        iconUrl: "https://objectstorage.bja.sealos.run/logo.svg",
        resourceType: "objectstoragebucket",
      },
    ],
    []
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const dir = e.shiftKey ? -1 : 1;
      const next =
        (activeIndex + dir + resourceTypes.length) % resourceTypes.length;
      setActiveIndex(next);
      itemsRef.current[next]?.focus();
    }
  };

  const handleResourceSelect = (resourceId: string) => {
    setSelectedResource(resourceId);
  };

  const handleBack = () => {
    setSelectedResource(null);
  };

  // If a resource is selected, show the create message
  if (selectedResource) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border p-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              {(() => {
                const resource = resourceTypes.find(
                  (r) => r.id === selectedResource
                );
                return (
                  <>
                    <div>
                      <h2 className="font-semibold">
                        Create {resource?.title}
                      </h2>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedResource === "add-devbox" && <DevboxCreateMessage />}
          {selectedResource === "add-database" && <ClusterCreateMessage />}
          {selectedResource === "add-app-launchpad" && (
            <LaunchpadCreateMessage />
          )}
          {selectedResource === "add-object-storage" && (
            <ObjectStorageCreateMessage payload={{}} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full bg-background">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Add Resource</h2>
        <p className="text-sm text-muted-foreground">
          Choose a resource type to add to your project
        </p>
      </div>

      <div className="space-y-3" onKeyDown={handleKeyDown}>
        {resourceTypes.map((resource, index) => (
          <button
            key={resource.id}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            onClick={() => handleResourceSelect(resource.id)}
            tabIndex={index === 0 ? 0 : -1}
            className="w-full text-left flex items-center justify-between p-4 border rounded-lg hover:brightness-150 cursor-pointer group transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleResourceSelect(resource.id);
              }
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Image
                src={resource.iconUrl}
                alt={`${resource.resourceType} Icon`}
                width={32}
                height={32}
                className="rounded-lg h-8 w-8 flex-shrink-0 p-1 bg-background-tertiary"
                priority
              />
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="font-medium text-sm leading-tight">
                  {resource.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-tight">
                  {resource.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium ">
              <span>Add</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CommandPanelAddResource({
  onSelect,
  onHover,
}: CommandPanelAddResourceProps) {
  return (
    <>
      <CommandGroup heading="Resource Management">
        <CommandItem
          value="add-resource"
          onSelect={onSelect}
          onMouseEnter={() => onHover?.("add-resource")}
          onMouseLeave={() => onHover?.(null)}
        >
          <Server className="mr-2 h-4 w-4" />
          <span>Add Resource</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
