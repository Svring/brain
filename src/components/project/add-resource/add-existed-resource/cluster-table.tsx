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
import { listClusterOptions } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/contexts/project/project-context";
import { useAddToProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function ClusterTable() {
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

  // Fetch cluster data
  const {
    data: clusters = [],
    isLoading: clusterLoading,
    error: clusterError,
  } = useQuery(listClusterOptions(k8sContext));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clusters</CardTitle>
      </CardHeader>
      <CardContent>
        {clusterLoading ? (
          <div className="text-center py-4">Loading clusters...</div>
        ) : clusterError ? (
          <div className="text-center py-4 text-red-500">
            Error loading clusters: {clusterError.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clusters.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No clusters found
                  </TableCell>
                </TableRow>
              ) : (
                clusters.map((cluster: any) => {
                  const resourceKey = createResourceKey(
                    "cluster",
                    cluster.name
                  );
                  const isAdding = addingResources.has(resourceKey);

                  return (
                    <TableRow key={cluster.name}>
                      <TableCell className="font-medium">
                        {cluster.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {cluster.type || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cluster.status === "Running"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {cluster.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cluster.inProject ? (
                          <span className="text-sm text-muted-foreground">
                            {(
                              allProjects.find(
                                (project: any) =>
                                  project.name === cluster.inProject
                              ) as any
                            )?.displayName || cluster.inProject}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isAdding}
                            className="hover:brightness-110 transition-all duration-200"
                            onClick={() =>
                              handleAddResource("cluster", cluster.name)
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
