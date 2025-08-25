import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Plus } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useProjectState } from "@/contexts/project/project-context";
import { deriveEnvVariable } from "@/lib/sealos/services/env/cluster/cluster-env-utils";
import { deriveObjectStorageEnvVariable } from "@/lib/sealos/services/env/objectstorage/objectstorage-env-utils";
import { createK8sContext } from "@/lib/auth/auth-utils";
import _ from "lodash";

interface EnvVariable {
  key: string;
  value: string;
  type?: string;
}

interface EnvVariablesTableProps {
  envVars: EnvVariable[];
  resourceName: string;
  onEnvVarsChange?: (envVars: EnvVariable[]) => void;
}

export function EnvVariablesTable({
  envVars,
  resourceName,
  onEnvVarsChange,
}: EnvVariablesTableProps) {
  const { copyToClipboard, isCopied } = useCopy();
  const { selectedProjectResources } = useProjectState();
  const [localEnvVars, setLocalEnvVars] = useState<EnvVariable[]>(envVars);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEnvVar, setNewEnvVar] = useState<EnvVariable>({
    key: "",
    value: "",
  });

  // Filter to only get cluster and objectstoragebucket resources
  const filteredResources = _.filter(
    selectedProjectResources,
    (resource: any) => {
      const resourceType = _.toLower(resource?.kind);
      return _.includes(["cluster", "objectstoragebucket"], resourceType);
    }
  );

  // Generate environment variables for cluster and object storage resources
  const k8sContext = createK8sContext();
  const clusterEnvVars = _.map(filteredResources, (resource: any) => {
    if (resource.kind.toLowerCase() === "cluster") {
      const derivedEnv = deriveEnvVariable(k8sContext, resource);
      return derivedEnv;
    }
    return null;
  }).filter(Boolean);

  const objectStorageEnvVars = _.map(filteredResources, (resource: any) => {
    if (resource.kind.toLowerCase() === "objectstoragebucket") {
      const derivedEnv = deriveObjectStorageEnvVariable(resource);
      return derivedEnv;
    }
    return null;
  }).filter(Boolean);

  // console.log("All cluster environment variables:", clusterEnvVars);
  // console.log(
  //   "All object storage environment variables:",
  //   objectStorageEnvVars
  // );

  const handleAddNewRow = () => {
    setIsAddingNew(true);
  };

  const handleSaveNewRow = () => {
    if (newEnvVar.key.trim()) {
      const updatedEnvVars = [...localEnvVars, { ...newEnvVar }];
      setLocalEnvVars(updatedEnvVars);
      onEnvVarsChange?.(updatedEnvVars);
      setNewEnvVar({ key: "", value: "" });
      setIsAddingNew(false);
    }
  };

  const handleCancelNewRow = () => {
    setNewEnvVar({ key: "", value: "" });
    setIsAddingNew(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveNewRow();
    } else if (e.key === "Escape") {
      handleCancelNewRow();
    }
  };

  const displayEnvVars = localEnvVars.length > 0 ? localEnvVars : envVars;

  if (!displayEnvVars || displayEnvVars.length === 0) {
    return (
      <div className="space-y-3 border border-dashed rounded-lg p-4">
        <p className="text-muted-foreground">
          No environment variables configured for this resource.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddNewRow}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Environment Variable
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 border border-dashed rounded-lg">
      <div className="w-full overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Key</TableHead>
              <TableHead className="w-2/3">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayEnvVars.map((envVar, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">{envVar.key}</TableCell>
                <TableCell className="max-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`truncate ${
                        !envVar.value ? "text-muted-foreground" : ""
                      }`}
                      title={envVar.value || "from secret"}
                    >
                      {envVar.value || "from secret"}
                    </span>
                    {envVar.value && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={() =>
                          copyToClipboard(
                            envVar.value!,
                            `env-${resourceName}-${envVar.key}`
                          )
                        }
                      >
                        {isCopied(`env-${resourceName}-${envVar.key}`) ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {isAddingNew && (
              <TableRow>
                <TableCell>
                  <Input
                    placeholder="Enter key"
                    value={newEnvVar.key}
                    onChange={(e) =>
                      setNewEnvVar({ ...newEnvVar, key: e.target.value })
                    }
                    onKeyDown={handleKeyPress}
                    className="font-mono"
                    autoFocus
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter value"
                      value={newEnvVar.value}
                      onChange={(e) =>
                        setNewEnvVar({ ...newEnvVar, value: e.target.value })
                      }
                      onKeyDown={handleKeyPress}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveNewRow}
                      disabled={!newEnvVar.key.trim()}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelNewRow}
                    >
                      ×
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={2}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddNewRow}
                  className="w-full text-muted-foreground"
                  disabled={isAddingNew}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Environment Variable
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
