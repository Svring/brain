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
import { listClusterOptions } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { listDeploymentOptions } from "@/lib/sealos/resources/deployment/deployment-method/deployment-query";
import { listStatefulSetOptions } from "@/lib/sealos/resources/statefulset/statefulset-method/statefulset-query";
import { listObjectStorageOptions } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/contexts/project/project-context";
import { useAddToProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AddExistedResourceTab() {
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

  // Fetch data for all resource types
  const {
    data: devboxes = [],
    isLoading: devboxLoading,
    error: devboxError,
  } = useQuery(listDevboxOptions(k8sContext));

  const {
    data: clusters = [],
    isLoading: clusterLoading,
    error: clusterError,
  } = useQuery(listClusterOptions(k8sContext));

  const {
    data: deployments = [],
    isLoading: deploymentLoading,
    error: deploymentError,
  } = useQuery(listDeploymentOptions(k8sContext));

  const {
    data: objectStorages = [],
    isLoading: objectStorageLoading,
    error: objectStorageError,
  } = useQuery(listObjectStorageOptions(k8sContext));

  const DevboxTable = () => (
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

  const ClusterTable = () => (
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

  const LaunchpadTable = () => (
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

  const ObjectStorageTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Object Storage</CardTitle>
      </CardHeader>
      <CardContent>
        {objectStorageLoading ? (
          <div className="text-center py-4">Loading object storage...</div>
        ) : objectStorageError ? (
          <div className="text-center py-4 text-red-500">
            Error loading object storage: {objectStorageError.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Policy</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {objectStorages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No object storage found
                  </TableCell>
                </TableRow>
              ) : (
                objectStorages.map((storage: any) => {
                  const resourceKey = createResourceKey(
                    "objectstoragebucket",
                    storage.name
                  );
                  const isAdding = addingResources.has(resourceKey);

                  return (
                    <TableRow key={storage.name}>
                      <TableCell className="font-medium">
                        {storage.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {storage.policy || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {storage.inProject ? (
                          <span className="text-sm text-muted-foreground">
                            {(
                              allProjects.find(
                                (project: any) =>
                                  project.name === storage.inProject
                              ) as any
                            )?.displayName || storage.inProject}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isAdding}
                            className="hover:brightness-110 transition-all duration-200"
                            onClick={() =>
                              handleAddResource("objectstoragebucket", storage.name)
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

  return (
    <div className="w-full">
      <Tabs defaultValue="devbox" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="devbox">Devbox</TabsTrigger>
          <TabsTrigger value="cluster">Cluster</TabsTrigger>
          <TabsTrigger value="launchpad">Launchpad</TabsTrigger>
          <TabsTrigger value="objectstorage">Object Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="devbox" className="">
          <DevboxTable />
        </TabsContent>

        <TabsContent value="cluster" className="">
          <ClusterTable />
        </TabsContent>

        <TabsContent value="launchpad" className="">
          <LaunchpadTable />
        </TabsContent>

        <TabsContent value="objectstorage" className="">
          <ObjectStorageTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
