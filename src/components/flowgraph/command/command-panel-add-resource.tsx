"use client";

import { CommandGroup, CommandItem } from "@/components/ui/command";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import DevboxCreateMessage from "@/components/chat/messages/system-messages.tsx/devbox/devbox-create-message";
import LaunchpadCreateMessage from "@/components/chat/messages/system-messages.tsx/launchpad/launchpad-create-message";
import ClusterCreateMessage from "@/components/chat/messages/system-messages.tsx/cluster/cluster-create-message";
import ObjectStorageCreateMessage from "@/components/chat/messages/system-messages.tsx/objectstorage/objectstorage-create-message";

interface ResourceListProps {
  onSelect: (resourceId: string) => void;
  onBack: () => void;
}

interface ResourceCreateProps {
  resourceId: string;
  onBack: () => void;
}

// Component that shows the list of resources to choose from
export function ResourceList({ onSelect, onBack }: ResourceListProps) {
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

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

  useEffect(() => {
    if (itemsRef.current[0]) {
      itemsRef.current[0]?.focus();
    }
  }, []);

  return (
    <CommandGroup heading="Resource Types">
      {resourceTypes.map((resource, index) => (
        <CommandItem
          key={resource.id}
          value={resource.id}
          onSelect={() => onSelect(resource.id)}
        >
          <Image
            src={resource.iconUrl}
            alt={`${resource.resourceType} Icon`}
            width={32}
            height={32}
            className="h-7 w-7 rounded-lg"
          />
          <span>{resource.title}</span>
          <div className="ml-auto flex items-center gap-1 text-muted-foreground">
            <span>Add</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

// Component that shows the create form for a specific resource
export function ResourceCreate({ resourceId, onBack }: ResourceCreateProps) {
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

  const resource = resourceTypes.find((r) => r.id === resourceId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-semibold">Create {resource?.title}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {resourceId === "add-devbox" && <DevboxCreateMessage />}
        {resourceId === "add-database" && <ClusterCreateMessage />}
        {resourceId === "add-app-launchpad" && <LaunchpadCreateMessage />}
        {resourceId === "add-object-storage" && (
          <ObjectStorageCreateMessage payload={{}} />
        )}
      </div>
    </div>
  );
}
