"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { listDeploymentOptions } from "@/lib/sealos/resources/deployment/deployment-method/deployment-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/contexts/project/project-context";
import { useAddToProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function LaunchpadTable() {
  const k8sContext = createK8sContext();
  const { selectedProject, allProjects } = useProjectState();
  const [addingResources, setAddingResources] = useState<Set<string>>(
    new Set()
  );

  const addToProjectMutation = useAddToProjectMutation(k8sContext);

  // Helper function to create resource key
  const createResourceKey = (type: string, name: string) => `${type}-${name}`;

  // Helper function to handle add resource
  const handleAddResource = async (type: string, name: string) => {
    if (selectedProject) {
      const resourceKey = createResourceKey(type, name);
      setAddingResources((prev) => new Set(prev).add(resourceKey));

      try {
        await addToProjectMutation.mutateAsync({
          resources: [convertResourceTypeToTarget(type, name)],
          name: selectedProject,
        });
      } finally {
        setAddingResources((prev) => {
          const newSet = new Set(prev);
          newSet.delete(resourceKey);
          return newSet;
        });
      }
    }
  };

  // Fetch deployment data
  const {
    data: deployments = [],
    isLoading: deploymentLoading,
    error: deploymentError,
  } = useQuery(listDeploymentOptions(k8sContext));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launchpad (Deployments & StatefulSets)</CardTitle>
      </CardHeader>
      <CardContent>
        {deploymentLoading ? (
          <div className="text-center py-4">Loading launchpad resources...</div>
        ) : deploymentError ? (
          <div className="text-center py-4 text-red-500">
            Error loading launchpad resources: {deploymentError.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No launchpad resources found
                  </TableCell>
                </TableRow>
              ) : (
                deployments.map((resource: any) => {
                  const resourceKey = createResourceKey(
                    resource.kind.toLowerCase(),
                    resource.name
                  );
                  const isAdding = addingResources.has(resourceKey);

                  return (
                    <TableRow key={`${resource.kind}-${resource.name}`}>
                      <TableCell className="font-medium">
                        {resource.name}
                      </TableCell>
                      <TableCell>
                        {resource.inProject ? (
                          <span className="text-sm text-muted-foreground">
                            {(
                              allProjects.find(
                                (project: any) =>
                                  project.name === resource.inProject
                              ) as any
                            )?.displayName || resource.inProject}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isAdding}
                            className="hover:brightness-150 transition-all duration-200"
                            onClick={() =>
                              handleAddResource(
                                resource.kind.toLowerCase(),
                                resource.name
                              )
                            }
                          >
                            {isAdding ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add"
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
