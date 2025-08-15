"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjectState } from "@/contexts/project/project-context";
import { resolveEnvVars } from "@/lib/k8s/k8s-method/k8s-utils";
import type { EnvVar } from "@/lib/k8s/k8s-method/k8s-utils";
import { createK8sContext } from "@/lib/auth/auth-utils";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DisplayEnvPanel() {
  const { selectedProjectResources } = useProjectState();
  const [resolvedEnvs, setResolvedEnvs] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const context = createK8sContext();

  // Filter deployment resources from selected project
  const deploymentResources =
    (selectedProjectResources as any)?.filter(
      (resource: any) => resource.kind?.toLowerCase() === "deployment"
    ) || [];

  // Resolve environment variables for deployments
  useEffect(() => {
    const resolveDeploymentEnvs = async () => {
      const newResolvedEnvs: Record<string, any[]> = {};
      const newLoadingStates: Record<string, boolean> = {};

      for (const deployment of deploymentResources) {
        if (deployment.env && Array.isArray(deployment.env)) {
          newLoadingStates[deployment.metadata?.name || deployment.name] = true;

          try {
            const resolvedEnv = await resolveEnvVars(context, deployment.env);
            newResolvedEnvs[deployment.metadata?.name || deployment.name] =
              resolvedEnv;
          } catch (error) {
            console.error(
              `Failed to resolve env for deployment ${
                deployment.metadata?.name || deployment.name
              }:`,
              error
            );
            newResolvedEnvs[deployment.metadata?.name || deployment.name] =
              deployment.env;
          } finally {
            newLoadingStates[deployment.metadata?.name || deployment.name] =
              false;
          }
        }
      }

      setResolvedEnvs(newResolvedEnvs);
      setIsLoading(newLoadingStates);
    };

    if (deploymentResources.length > 0) {
      resolveDeploymentEnvs();
    }
  }, [deploymentResources]);

  return (
    <div className="">
      <Tabs defaultValue="devbox" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devbox">Devbox</TabsTrigger>
          <TabsTrigger value="applaunchpad">App Launchpad</TabsTrigger>
        </TabsList>

        <TabsContent value="devbox" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Devbox Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Devbox environment information will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applaunchpad" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>App Launchpad - Deployment Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {deploymentResources.length === 0 ? (
                <p className="text-muted-foreground">
                  No deployment resources found in the selected project.
                </p>
              ) : (
                <div className="space-y-4">
                  {deploymentResources.map((deployment: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-medium text-lg">
                          {deployment.name}
                        </h3>
                        <Badge variant="secondary">{deployment.kind}</Badge>
                      </div>

                      {deployment.env && deployment.env.length > 0 ? (
                        <div>
                          {isLoading[
                            deployment.metadata?.name || deployment.name
                          ] ? (
                            <div className="text-muted-foreground text-sm">
                              Resolving environment variables...
                            </div>
                          ) : (
                            <Table>
                              <TableCaption>
                                Environment variables for {deployment.name}
                              </TableCaption>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-1/3">Variable Name</TableHead>
                                  <TableHead className="w-2/3">Value</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {resolvedEnvs[
                                  deployment.metadata?.name || deployment.name
                                ]?.map((envVar: any, envIndex: number) => (
                                  <TableRow key={envIndex}>
                                    <TableCell className="font-mono text-sm">
                                      {envVar.key}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      {envVar.type === "value" ? (
                                        <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                                          {envVar.value}
                                        </span>
                                      ) : envVar.type === "secretKeyRef" ? (
                                        <span className="text-muted-foreground text-sm">
                                          From: {envVar.secretName}.{envVar.secretKey}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">
                                          Unknown type
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )) ||
                                  deployment.env.map(
                                    (envVar: any, envIndex: number) => (
                                      <TableRow key={envIndex}>
                                        <TableCell className="font-mono text-sm">
                                          {envVar.name}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                          {envVar.value ? (
                                            <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                                              {envVar.value}
                                            </span>
                                          ) : envVar.valueFrom?.secretKeyRef ? (
                                            <span className="text-muted-foreground text-sm">
                                              From: {envVar.valueFrom.secretKeyRef.name}
                                            </span>
                                          ) : (
                                            <span className="text-muted-foreground text-sm">
                                              No value set
                                            </span>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          No environment variables configured for this
                          deployment.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
