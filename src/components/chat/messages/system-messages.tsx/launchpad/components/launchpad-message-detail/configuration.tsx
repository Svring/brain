import React, { useState } from "react";
import {
  PenLine,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  File,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { Spinner } from "@/components/ui/spinner";

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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldSubmit = async (fieldType: string, data: any) => {
    let updateData: any = {};

    switch (fieldType) {
      case "commandArgs":
        updateData = {
          command: data.command,
          args: data.args,
        };
        break;
      case "env":
        updateData = { env: data.env };
        break;
      case "storage":
        // Transform back to the expected format
        updateData = { 
          storage: (data.storage || []).map((item: any) => ({
            path: item.path || "",
            value: item.size || "1Gi"
          }))
        };
        break;
      case "configMap":
        // Transform back to the expected format
        updateData = { 
          configMap: (data.configMap || []).map((item: any) => ({
            path: item.path || "",
            content: item.value || ""
          }))
        };
        break;
    }

    await onConfigUpdate("config", updateData);
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  return (
    <div className="border border-dashed rounded-lg">
      {/* Header with Collapse Toggle */}
      <div className="flex items-center justify-between p-2 border-b border-dashed">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <h3 className="font-medium">Advanced Configuration</h3>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Command & Arguments Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Command & Arguments</h4>
              {editingField === "commandArgs" ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X />
                  </Button>
                  <Button
                    type="submit"
                    form="launchpad-update-form"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner variant="bars" className="h-4 w-4" />
                    ) : (
                      <Check />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => setEditingField("commandArgs")}
                  disabled={isLoading}
                >
                  <PenLine className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div
              className={`${
                editingField === "commandArgs" ? "p-4" : "p-2"
              } bg-muted/20 rounded-lg`}
            >
              {editingField === "commandArgs" ? (
                <LaunchpadUpdateForm
                  defaultValues={{
                    command: command || "",
                    args: args || "",
                  }}
                  onSubmit={(data) => handleFieldSubmit("commandArgs", data)}
                  isLoading={isLoading}
                  hideDefaultButton={true}
                />
              ) : (
                <div className="space-y-3">
                  <div className="text-start">
                    <div className="text-sm text-muted-foreground">Command</div>
                    <div className="text-sm font-medium break-words">
                      {command || "N/A"}
                    </div>
                  </div>
                  <div className="text-start">
                    <div className="text-sm text-muted-foreground">
                      Arguments
                    </div>
                    <div className="text-sm font-medium break-words">
                      {args || "N/A"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Environment Variables Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Environment Variables</h4>
              {editingField === "env" ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X />
                  </Button>
                  <Button
                    type="submit"
                    form="launchpad-update-form"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner variant="bars" className="h-4 w-4" />
                    ) : (
                      <Check />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => setEditingField("env")}
                  disabled={isLoading}
                >
                  <PenLine className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div
              className={`${
                editingField === "env" ? "p-4" : "p-2"
              } bg-muted/20 rounded-lg`}
            >
              {editingField === "env" ? (
                <LaunchpadUpdateForm
                  defaultValues={{ env: envVars }}
                  onSubmit={(data) => handleFieldSubmit("env", data)}
                  isLoading={isLoading}
                  hideDefaultButton={true}
                />
              ) : (
                <div className="max-h-32 overflow-y-auto">
                  {envVars && Array.isArray(envVars) && envVars.length > 0 ? (
                    <div className="space-y-2">
                      {envVars.map((envVar: any, index: number) => (
                        <div
                          key={index}
                          className="text-sm p-2 bg-muted rounded"
                        >
                          <div className="font-medium">{envVar.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {envVar.valueFrom ? (
                              <span className="flex items-center gap-1">
                                <span>From Secret:</span>
                                <span className="font-mono bg-background px-1 rounded">
                                  {envVar.valueFrom.secretKeyRef?.name || "N/A"}
                                </span>
                                <span>→</span>
                                <span className="font-mono bg-background px-1 rounded">
                                  {envVar.valueFrom.secretKeyRef?.key || "N/A"}
                                </span>
                              </span>
                            ) : (
                              envVar.value || "N/A"
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center">
                      N/A
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Config Map Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Config Map Entries</h4>
              {editingField === "configMap" ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X />
                  </Button>
                  <Button
                    type="submit"
                    form="launchpad-update-form"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner variant="bars" className="h-4 w-4" />
                    ) : (
                      <Check />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => setEditingField("configMap")}
                  disabled={isLoading}
                >
                  <PenLine className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div
              className={`${
                editingField === "configMap" ? "p-4" : "p-2"
              } bg-muted/20 rounded-lg`}
            >
              {editingField === "configMap" ? (
                <LaunchpadUpdateForm
                  defaultValues={{ 
                    configMap: (configMap || []).map(item => ({
                      path: item.path || "",
                      value: item.content || item.value || ""
                    }))
                  }}
                  onSubmit={(data) => handleFieldSubmit("configMap", data)}
                  isLoading={isLoading}
                  hideDefaultButton={true}
                />
              ) : (
                <div className="max-h-32 overflow-y-auto">
                  {configMap && configMap.length > 0 ? (
                    <div className="space-y-2">
                      {configMap.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="text-sm p-2 bg-muted rounded flex items-stretch gap-4"
                        >
                          <div className="flex items-center">
                            <File />
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="font-medium">{item.path}</div>
                            <div className="text-muted-foreground text-xs">
                              {item.content || item.value || "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center">
                      N/A
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Storage Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Storage Volumes</h4>
              {editingField === "storage" ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X />
                  </Button>
                  <Button
                    type="submit"
                    form="launchpad-update-form"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner variant="bars" className="h-4 w-4" />
                    ) : (
                      <Check />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => setEditingField("storage")}
                  disabled={isLoading}
                >
                  <PenLine className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div
              className={`${
                editingField === "storage" ? "p-4" : "p-2"
              } bg-muted/20 rounded-lg`}
            >
              {editingField === "storage" ? (
                <LaunchpadUpdateForm
                  defaultValues={{ 
                    storage: (storage || []).map(item => ({
                      path: item.path || "",
                      size: item.size || item.value || "1Gi"
                    }))
                  }}
                  onSubmit={(data) => handleFieldSubmit("storage", data)}
                  isLoading={isLoading}
                  hideDefaultButton={true}
                />
              ) : (
                <div className="max-h-32 overflow-y-auto">
                  {storage && storage.length > 0 ? (
                    <div className="space-y-2">
                      {storage.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="text-sm p-2 bg-muted rounded flex items-stretch gap-4"
                        >
                          <div className="flex items-center">
                            <HardDrive />
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="font-medium">{item.path}</div>
                            <div className="text-muted-foreground text-xs">
                              {item.value ? `${item.value} Gi` : "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center">
                      N/A
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
