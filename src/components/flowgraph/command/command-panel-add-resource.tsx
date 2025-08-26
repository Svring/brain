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
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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
        icon: <Box className="h-8 w-8" />,
        color: "bg-blue-500",
      },
      {
        id: "add-database",
        title: "Database",
        description: "Managed database service",
        icon: <Database className="h-8 w-8" />,
        color: "bg-green-500",
      },
      {
        id: "add-app-launchpad",
        title: "App Launchpad",
        description: "Application deployment platform",
        icon: <Rocket className="h-8 w-8" />,
        color: "bg-purple-500",
      },
      {
        id: "add-object-storage",
        title: "Object Storage",
        description: "Cloud object storage service",
        icon: <HardDrive className="h-8 w-8" />,
        color: "bg-orange-500",
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

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Add Resource</h2>
        <p className="text-sm text-muted-foreground">
          Choose a resource type to add to your project
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4" onKeyDown={handleKeyDown}>
        {resourceTypes.map((resource, index) => (
          <button
            key={resource.id}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            onClick={() => onSelect(resource.id)}
            tabIndex={index === 0 ? 0 : -1}
            className="text-left p-4 border rounded-lg cursor-pointer hover:bg-accent focus:bg-accent focus:outline-none transition-colors group"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(resource.id);
              }
            }}
          >
            <div
              className={`${resource.color} text-white p-3 rounded-lg mb-3 w-fit group-hover:scale-105 transition-transform`}
            >
              {resource.icon}
            </div>
            <h3 className="font-medium mb-1">{resource.title}</h3>
            <p className="text-xs text-muted-foreground">
              {resource.description}
            </p>
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
