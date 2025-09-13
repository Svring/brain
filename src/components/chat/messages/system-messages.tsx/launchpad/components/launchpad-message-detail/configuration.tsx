import React, { useState } from "react";
import { Edit3 } from "lucide-react";
import { ConfigDialog } from "./config-dialog";

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
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);

  const handleFieldSubmit = async (fieldType: string, data: any) => {
    let updateData: any = {};

    switch (fieldType) {
      case "commandArgs":
        updateData = {
          launchCommand: {
            command: data.launchCommand?.command,
            args: data.launchCommand?.args,
          },
        };
        break;
      case "env":
        // Use dialog-provided env as the source of truth; filter invalid entries
        updateData = {
          env: (data.env || [])
            .filter((envVar: any) => envVar?.name && envVar.name.trim() !== "")
            .map((envVar: any) => ({
              name: envVar.name,
              value: envVar.value,
              valueFrom: envVar.valueFrom,
            })),
        };
        break;
      case "storage":
        // Transform back to the expected format
        updateData = {
          storage: (data.storage || []).map((item: any) => ({
            path: item.path || "",
            value: item.size || "1Gi",
          })),
        };
        break;
      case "configMap":
        // Transform back to the expected format (use value, not content)
        updateData = {
          configMap: (data.configMap || []).map((item: any) => ({
            path: item.path || "",
            value: item.value || "",
          })),
        };
        break;
    }

    await onConfigUpdate("config", updateData);
  };

  const handleDialogClose = () => {
    setDialogOpen(null);
  };

  const getFieldInfo = (fieldType: string) => {
    switch (fieldType) {
      case "commandArgs":
        return {
          title: "Command",
          isEmpty: !command && !args,
          summary:
            command || args
              ? `${command ? "Command set" : ""}${command && args ? ", " : ""}${
                  args ? "Args set" : ""
                }`
              : "No command or arguments",
        };
      case "env":
        return {
          title: "Environment",
          isEmpty: !envVars || envVars.length === 0,
          summary:
            envVars && envVars.length > 0
              ? `${envVars.length} variable${envVars.length > 1 ? "s" : ""}`
              : "No environment variables",
        };
      case "configMap":
        return {
          title: "Config Map",
          isEmpty: !configMap || configMap.length === 0,
          summary:
            configMap && configMap.length > 0
              ? `${configMap.length} entr${configMap.length > 1 ? "ies" : "y"}`
              : "No config map entries",
        };
      case "storage":
        return {
          title: "Storage",
          isEmpty: !storage || storage.length === 0,
          summary:
            storage && storage.length > 0
              ? `${storage.length} volume${storage.length > 1 ? "s" : ""}`
              : "No storage volumes",
        };
      default:
        return { title: "", isEmpty: true, summary: "" };
    }
  };

  return (
    <div className="">
      {/* Content - Always Visible */}
      <div className="p-2">
        <div className="grid grid-cols-2 gap-4">
          {/* Command & Arguments */}
          {(() => {
            const fieldInfo = getFieldInfo("commandArgs");
            return (
              <div
                className="flex flex-col space-y-1 flex-1 cursor-pointer transition-colors"
                onClick={() => setDialogOpen("commandArgs")}
                title="Click to edit command & arguments"
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    {fieldInfo.title}
                  </span>
                  <Edit3 className="h-3 w-3 text-muted-foreground/60" />
                </div>
                <span className="text-sm font-medium truncate">
                  {fieldInfo.summary}
                </span>
              </div>
            );
          })()}

          {/* Environment Variables */}
          {(() => {
            const fieldInfo = getFieldInfo("env");
            return (
              <div
                className="flex flex-col space-y-1 flex-1 cursor-pointer transition-colors"
                onClick={() => setDialogOpen("env")}
                title="Click to edit environment variables"
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    {fieldInfo.title}
                  </span>
                  <Edit3 className="h-3 w-3 text-muted-foreground/60" />
                </div>
                <span className="text-sm font-medium truncate">
                  {fieldInfo.summary}
                </span>
              </div>
            );
          })()}

          {/* Config Map Entries */}
          {(() => {
            const fieldInfo = getFieldInfo("configMap");
            return (
              <div
                className="flex flex-col space-y-1 flex-1 cursor-pointer transition-colors"
                onClick={() => setDialogOpen("configMap")}
                title="Click to edit config map entries"
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    {fieldInfo.title}
                  </span>
                  <Edit3 className="h-3 w-3 text-muted-foreground/60" />
                </div>
                <span className="text-sm font-medium truncate">
                  {fieldInfo.summary}
                </span>
              </div>
            );
          })()}

          {/* Storage Volumes */}
          {(() => {
            const fieldInfo = getFieldInfo("storage");
            return (
              <div
                className="flex flex-col space-y-1 flex-1 cursor-pointer transition-colors"
                onClick={() => setDialogOpen("storage")}
                title="Click to edit storage volumes"
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    {fieldInfo.title}
                  </span>
                  <Edit3 className="h-3 w-3 text-muted-foreground/60" />
                </div>
                <span className="text-sm font-medium truncate">
                  {fieldInfo.summary}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Configuration Dialogs */}
      {dialogOpen === "commandArgs" && (
        <ConfigDialog
          isOpen={dialogOpen === "commandArgs"}
          onClose={handleDialogClose}
          fieldType="commandArgs"
          fieldTitle="Command & Arguments"
          defaultValues={
            command || args
              ? {
                  launchCommand: {
                    command: command || "",
                    args: args || "",
                  },
                }
              : {}
          }
          onSubmit={(data) => handleFieldSubmit("commandArgs", data)}
          isLoading={isLoading}
        />
      )}

      {dialogOpen === "env" && (
        <ConfigDialog
          isOpen={dialogOpen === "env"}
          onClose={handleDialogClose}
          fieldType="env"
          fieldTitle="Environment Variables"
          defaultValues={{ env: envVars }}
          onSubmit={(data) => handleFieldSubmit("env", data)}
          isLoading={isLoading}
        />
      )}

      {dialogOpen === "configMap" && (
        <ConfigDialog
          isOpen={dialogOpen === "configMap"}
          onClose={handleDialogClose}
          fieldType="configMap"
          fieldTitle="Config Map Entries"
          defaultValues={{
            configMap: (configMap || []).map((item) => ({
              path: item.path || "",
              value: item.content || item.value || "",
            })),
          }}
          onSubmit={(data) => handleFieldSubmit("configMap", data)}
          isLoading={isLoading}
        />
      )}

      {dialogOpen === "storage" && (
        <ConfigDialog
          isOpen={dialogOpen === "storage"}
          onClose={handleDialogClose}
          fieldType="storage"
          fieldTitle="Storage Volumes"
          defaultValues={{
            storage: (storage || []).map((item) => ({
              path: item.path || "",
              size: item.size || item.value || "1Gi",
            })),
          }}
          onSubmit={(data) => handleFieldSubmit("storage", data)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
