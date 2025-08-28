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
import { LaunchpadObject } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import { Separator } from "@/components/ui/separator";

interface LaunchpadMessageDetailsProps {
  launchpadObject: LaunchpadObject;
}

export const LaunchpadMessageDetails: React.FC<
  LaunchpadMessageDetailsProps
> = ({ launchpadObject }) => {
  const { resource, image, operationalStatus, env, command, args } =
    launchpadObject;

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
      {/* Basic Information */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Basic</h3>
        <div className="space-y-4">
          {/* Image Info */}
          {image && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Image</span>
              <span className="text-sm font-medium truncate">{image}</span>
            </div>
          )}

          {/* Created At Info */}
          {operationalStatus && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Created At</span>
              <span className="text-sm font-medium truncate">
                {operationalStatus.createdAt}
              </span>
            </div>
          )}

          {/* CPU and Memory Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">CPU</span>
              <span className="text-sm font-medium">{resource?.cpu}Core</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Memory</span>
              <span className="text-sm font-medium">{resource?.memory}GB</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Deployment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Deployment</h3>
        <div className="space-y-4">
          {/* Replicas Info */}
          {resource && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Replicas</span>
              <span className="text-sm font-medium">
                {resource.replicas || "N/A"}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

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

        {/* Advanced Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Advanced</h3>
          <div className="space-y-4">
            {/* Environment Variables */}
            {envVars.length > 0 && (
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Environment Variables
                </span>
                <span className="text-sm font-medium">{envVars.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Storage Information */}
        {/* {launchpadObject.storage && launchpadObject.storage.length > 0 && (
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
        {/* {launchpadObject.configMap && launchpadObject.configMap.length > 0 && (
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
        )} */}
      </Accordion>
    </div>
  );
};

export default LaunchpadMessageDetails;
