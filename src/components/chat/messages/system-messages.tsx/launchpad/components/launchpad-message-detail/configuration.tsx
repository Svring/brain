import React, { useState } from "react";
import { PenLine, X } from "lucide-react";
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

  const handleConfigSubmit = async (data: LaunchpadUpdateFormData) => {
    await onConfigUpdate("config", data);
    setIsConfigEditing(false);
  };

  return (
    <div className="border border-dashed rounded-lg">
      <div className="flex items-center justify-between p-2 border-b border-dashed">
        <h3 className="font-medium">Configuration</h3>
        {isConfigEditing ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-1"
              onClick={() => setIsConfigEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="h-6 w-6 p-1"
            onClick={() => setIsConfigEditing(true)}
          >
            <PenLine className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className={`p-2 ${isConfigEditing ? "p-4" : "p-2"}`}>
        {isConfigEditing ? (
          <LaunchpadUpdateForm
            defaultValues={{
              command: command || "",
              args: args || "",
              env: envVars || [],
            }}
            onSubmit={handleConfigSubmit}
            isLoading={isLoading}
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
              <div className="text-sm text-muted-foreground">
                Env Variables
              </div>
              <div className="text-sm font-medium text-center">
                {envVars.length > 0 ? `${envVars.length} variables` : "N/A"}
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
