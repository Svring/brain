"use client";

import {
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { Server } from "lucide-react";
import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";
import { EnvTable } from "@/components/chat/messages/system-messages.tsx/components/env-table";

interface CommandPanelEnvironmentProps {
  onSelect: (value: string) => void;
  onHover?: (value: string | null) => void;
}

// Type definitions for resource data
interface ResourceData {
  name?: string;
  kind?: string;
  env?: Array<{
    name: string;
    value?: string;
  }>;
}

// Environment preview component for the detail panel
export function EnvironmentPreview({
  onSelect,
  autoFocus = false,
}: {
  onSelect: (value: string) => void;
  autoFocus?: boolean;
}) {
  const { nodes } = useFlowgraphState();
  const selectedProjectResources = nodes.map((node) => node.data);

  // Filter resources that have environment variables
  const resourcesWithEnv = selectedProjectResources.filter((resource) => {
    const typedResource = resource as ResourceData;
    return (
      typedResource &&
      (typedResource.kind === "Devbox" ||
        typedResource.kind === "Deployment" ||
        typedResource.kind === "StatefulSet") &&
      typedResource.env &&
      Array.isArray(typedResource.env) &&
      typedResource.env.length > 0
    );
  });

  return (
    <div className="p-6 h-full bg-background">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Environment</h2>
        <p className="text-sm text-muted-foreground">
          Manage environment variables and configuration
        </p>
      </div>

      <div className="space-y-6">
        {resourcesWithEnv.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-sm">
                No resources with environment variables found
              </p>
            </div>
          </div>
        ) : (
          resourcesWithEnv.map((resource, index) => {
            const typedResource = resource as ResourceData;
            const envVars = typedResource.env!.map((env) => ({
              type: "value" as const,
              name: env.name,
              value: env.value || "",
            }));

            return (
              <div
                key={`${typedResource.name}-${index}`}
                className="space-y-3 flex-col bg-background-secondary p-3 rounded-xl"
              >
                {/* Resource Header */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {typedResource.kind === "Devbox" ? (
                        <img
                          src="https://devbox.bja.sealos.run/logo.svg"
                          alt="Devbox Icon"
                          className="w-full h-full object-cover p-1"
                        />
                      ) : typedResource.kind === "Deployment" ||
                        typedResource.kind === "StatefulSet" ? (
                        <img
                          src="https://applaunchpad.bja.sealos.run/logo.svg"
                          alt="App Launchpad Icon"
                          className="w-full h-full object-cover p-1 rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            {typedResource.kind?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="text-lg leading-tight font-medium">
                      {typedResource.name || "Unnamed Resource"}
                    </div>
                  </div>
                </div>

                {/* Environment Variables Table */}
                <div className="space-y-2">
                  <EnvTable
                    envVars={envVars}
                    allowEditing={true}
                    compact={true}
                    onEnvVarsChange={(updatedEnvVars) => {
                      // Placeholder for future implementation
                      console.log(
                        `Updated environment variables for ${typedResource.name}:`,
                        updatedEnvVars
                      );
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function CommandPanelEnvironment({
  onSelect,
  onHover,
}: CommandPanelEnvironmentProps) {
  return (
    <>
      <CommandGroup heading="Environment Management">
        <CommandItem
          value="environment"
          onSelect={onSelect}
          onMouseEnter={() => onHover?.("environment")}
          onMouseLeave={() => onHover?.(null)}
        >
          <Server className="mr-2 h-4 w-4" />
          <span>Environment</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
