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
import { listDevboxOptions } from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/contexts/project/project-context";
import { useAddToProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function DevboxTable() {
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

  // Fetch devbox data
  const {
    data: devboxes = [],
    isLoading: devboxLoading,
    error: devboxError,
  } = useQuery(listDevboxOptions(k8sContext));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devboxes</CardTitle>
      </CardHeader>
      <CardContent>
        {devboxLoading ? (
          <div className="text-center py-4">Loading devboxes...</div>
        ) : devboxError ? (
          <div className="text-center py-4 text-red-500">
            Error loading devboxes: {devboxError.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devboxes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No devboxes found
                  </TableCell>
                </TableRow>
              ) : (
                devboxes.map((devbox: any) => {
                  const resourceKey = createResourceKey("devbox", devbox.name);
                  const isAdding = addingResources.has(resourceKey);

                  return (
                    <TableRow key={devbox.name}>
                      <TableCell className="font-medium">
                        {devbox.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            devbox.status === "Running"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {devbox.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {devbox.inProject ? (
                          <span className="text-sm text-muted-foreground">
                            {(
                              allProjects.find(
                                (project: any) =>
                                  project.name === devbox.inProject
                              ) as any
                            )?.displayName || devbox.inProject}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isAdding}
                            className="hover:brightness-110 transition-all duration-200"
                            onClick={() =>
                              handleAddResource("devbox", devbox.name)
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
