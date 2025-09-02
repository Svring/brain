import React, { useState } from "react";
import { PenLine, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";

interface ConfigurationProps {
  command?: string;
  args?: string;
  envVars: any[];
  configMap?: any[];
  storage?: any[];
  onConfigUpdate: (type: string, data?: any) => Promise<void>;
  isLoading?: boolean;
}

export const Configuration: React.FC<ConfigurationProps> = ({
  command,
  args,
  envVars,
  configMap,
  storage,
  onConfigUpdate,
  isLoading = false,
}) => {
  const [isConfigEditing, setIsConfigEditing] = useState(false);

  // Filter env vars only when entering edit mode
  const getFilteredEnvVars = () => {
    if (!envVars || !Array.isArray(envVars)) return [];
    return envVars
      .filter((envVar: any) => envVar.type !== "secretKeyRef")
      .map((envVar: any) => ({
        type: "value" as const,
        name: envVar.name,
        value: envVar.value,
      }));
  };

  const handleConfigSubmit = async (data: LaunchpadUpdateFormData) => {
    await onConfigUpdate("config", data);
    setIsConfigEditing(false);
  };

  return (
    <div className="border border-dashed rounded-lg">
      <div className="flex items-center justify-between p-2 border-b border-dashed">
        <h3 className="font-medium">Advanced Configuration</h3>
        {isConfigEditing ? (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8"
              onClick={() => setIsConfigEditing(false)}
            >
              <X />
            </Button>
            <Button
              type="submit"
              form="launchpad-update-form"
              variant="outline"
              size="sm"
              className="h-8 w-8"
            >
              <Check />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8"
            onClick={() => setIsConfigEditing(true)}
          >
            <PenLine />
          </Button>
        )}
      </div>
      <div className={`p-2 ${isConfigEditing ? "p-4" : "p-2"}`}>
        {isConfigEditing ? (
          <LaunchpadUpdateForm
            defaultValues={{
              command: command || "",
              args: args || "",
              env: getFilteredEnvVars(),
            }}
            onSubmit={handleConfigSubmit}
            isLoading={isLoading}
            hideDefaultButton={true}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Command</div>
              <div className="text-sm font-medium text-center">
                {command || "N/A"}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Env Variables</div>
              <div className="text-sm font-medium text-center">
                {envVars && Array.isArray(envVars) && envVars.length > 0
                  ? `${envVars.length} variables`
                  : "N/A"}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Config Map</div>
              <div className="text-sm font-medium text-center">
                {configMap && configMap.length > 0
                  ? `${configMap.length} items`
                  : "N/A"}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Volumes</div>
              <div className="text-sm font-medium text-center">
                {storage && storage.length > 0
                  ? `${storage.length} volumes`
                  : "N/A"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
