import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, Terminal, Database, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EnvTable } from "../../components/env-table";

interface LaunchpadMessageDetailsProps {
  launchpadObject: any;
}

export const LaunchpadMessageDetails: React.FC<
  LaunchpadMessageDetailsProps
> = ({ launchpadObject }) => {
  const { resource, image, operationalStatus, env, command, args } =
    launchpadObject;

  const formatValue = (value: any, type: "cpu" | "memory" | "storage") => {
    if (!value) return "N/A";
    if (type === "cpu") return `${value}m`;
    if (type === "memory") return `${value}MB`;
    if (type === "storage") return `${value}GB`;
    return value;
  };

  const formatEnvVars = (envVars: any) => {
    if (!envVars || !Array.isArray(envVars)) return [];
    return envVars.map((envVar: any) => ({
      key: envVar.name || envVar.key,
      value: envVar.value || envVar.val,
    }));
  };

  const envVars = formatEnvVars(env);

  return (
    <div className="space-y-4">
      {/* Basic Information - Always Visible */}
      <div className="space-y-4">
        {/* Replicas and Created At Info */}
        <div className="grid grid-cols-2 gap-6">
          {resource && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Replicas</span>
              <span className="text-sm font-medium">
                {resource.replicas || "N/A"}
              </span>
            </div>
          )}
          {operationalStatus && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Created At</span>
              <span className="text-sm font-medium truncate">
                {operationalStatus.createdAt}
              </span>
            </div>
          )}
        </div>

        {/* CPU and Memory Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">CPU</span>
            <span className="text-sm font-medium">
              {formatValue(resource?.cpu, "cpu")}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Memory</span>
            <span className="text-sm font-medium">
              {formatValue(resource?.memory, "memory")}
            </span>
          </div>
        </div>

        {/* Image Info */}
        {image && (
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Image</span>
            <span className="text-sm font-medium truncate">{image}</span>
          </div>
        )}
      </div>

      {/* Advanced Information - Collapsible Sections */}
      <Accordion type="multiple" className="w-full space-y-1">
        {/* Command & Arguments */}
        {(command || args) && (
          <AccordionItem
            value="command-args"
            className="inset-ring inset-ring-border rounded-lg"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <Terminal className="h-4 w-4" />
                <span className="font-medium">Command & Arguments</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              {command && (
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Command</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {command}
                  </code>
                </div>
              )}
              {args && (
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Arguments
                  </span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {args}
                  </code>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Environment Variables */}
        {envVars.length > 0 && (
          <AccordionItem
            value="env-vars"
            className="inset-ring inset-ring-border rounded-lg"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <Settings className="h-4 w-4" />
                <span className="font-medium">Environment Variables</span>
                <Badge variant="secondary" className="ml-auto">
                  {envVars.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <EnvTable
                envVars={envVars.map((envVar: any) => ({
                  type: "value" as const,
                  name: envVar.key,
                  value: envVar.value,
                }))}
                allowEditing={false}
              />
            </AccordionContent>
          </AccordionItem>
        )}



        {/* Storage Information */}
        {launchpadObject.storage && launchpadObject.storage.length > 0 && (
          <AccordionItem
            value="storage"
            className="inset-ring inset-ring-border rounded-lg"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <Database className="h-4 w-4" />
                <span className="font-medium">Storage</span>
                <Badge variant="secondary" className="ml-auto">
                  {launchpadObject.storage.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              {launchpadObject.storage.map((storage: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{storage.name}</span>
                    <Badge variant="outline">{storage.size}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mount Path: {storage.path}
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ConfigMap Information */}
        {launchpadObject.configMap && launchpadObject.configMap.length > 0 && (
          <AccordionItem
            value="configmap"
            className="inset-ring inset-ring-border rounded-lg"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <Settings className="h-4 w-4" />
                <span className="font-medium">ConfigMap</span>
                <Badge variant="secondary" className="ml-auto">
                  {launchpadObject.configMap.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              {launchpadObject.configMap.map((config: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Path: {config.path}
                    </span>
                    <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                      {config.value}
                    </code>
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default LaunchpadMessageDetails;
