import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
}

export function EnvVariablesTable({
  envVars,
  resourceName,
}: EnvVariablesTableProps) {
  const { copyToClipboard, isCopied } = useCopy();
  const { selectedProjectResources } = useProjectState();

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
      console.log(`Cluster ${resource.name} derived env vars:`, derivedEnv);
      return derivedEnv;
    }
    return null;
  }).filter(Boolean);

  const objectStorageEnvVars = _.map(filteredResources, (resource: any) => {
    if (resource.kind.toLowerCase() === "objectstoragebucket") {
      const derivedEnv = deriveObjectStorageEnvVariable(resource);
      console.log(
        `Object Storage ${resource.name} derived env vars:`,
        derivedEnv
      );
      return derivedEnv;
    }
    return null;
  }).filter(Boolean);

  console.log("All cluster environment variables:", clusterEnvVars);
  console.log(
    "All object storage environment variables:",
    objectStorageEnvVars
  );

  if (!envVars || envVars.length === 0) {
    return (
      <p className="text-muted-foreground">
        No environment variables configured for this resource.
      </p>
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
            {envVars.map((envVar, index) => (
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
