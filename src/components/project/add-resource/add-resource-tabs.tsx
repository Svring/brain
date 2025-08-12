"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/contexts/project/project-context";
import { useAddToProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

export default function AddResourceTabs() {
  const k8sContext = createK8sContext();
  const { selectedProject } = useProjectState();

  const addToProjectMutation = useAddToProjectMutation(k8sContext);

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
    data: statefulSets = [],
    isLoading: statefulSetLoading,
    error: statefulSetError,
  } = useQuery(listStatefulSetOptions(k8sContext));

  // Combine deployments and statefulsets for launchpad tab
  const launchpadResources = [...deployments, ...statefulSets];
  const launchpadLoading = deploymentLoading || statefulSetLoading;
  const launchpadError = deploymentError || statefulSetError;

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
                devboxes.map((devbox: any) => (
                  <TableRow key={devbox.name}>
                    <TableCell className="font-medium">{devbox.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          devbox.status === "Running" ? "default" : "secondary"
                        }
                      >
                        {devbox.status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (
                            selectedProject &&
                            typeof selectedProject === "object" &&
                            "name" in selectedProject
                          ) {
                            addToProjectMutation.mutate({
                              resources: [
                                convertResourceTypeToTarget(
                                  "devbox",
                                  devbox.name
                                ),
                              ],
                              name: selectedProject.name as string,
                            });
                          }
                        }}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
                clusters.map((cluster: any) => (
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
                          cluster.status === "Running" ? "default" : "secondary"
                        }
                      >
                        {cluster.status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (
                            selectedProject &&
                            typeof selectedProject === "object" &&
                            "name" in selectedProject
                          ) {
                            addToProjectMutation.mutate({
                              resources: [
                                convertResourceTypeToTarget(
                                  "cluster",
                                  cluster.name
                                ),
                              ],
                              name: selectedProject.name as string,
                            });
                          }
                        }}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
        {launchpadLoading ? (
          <div className="text-center py-4">Loading launchpad resources...</div>
        ) : launchpadError ? (
          <div className="text-center py-4 text-red-500">
            Error loading launchpad resources: {launchpadError.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {launchpadResources.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No launchpad resources found
                  </TableCell>
                </TableRow>
              ) : (
                launchpadResources.map((resource: any) => (
                  <TableRow key={`${resource.kind}-${resource.name}`}>
                    <TableCell className="font-medium">
                      {resource.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {resource.image || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (
                            selectedProject &&
                            typeof selectedProject === "object" &&
                            "name" in selectedProject
                          ) {
                            addToProjectMutation.mutate({
                              resources: [
                                convertResourceTypeToTarget(
                                  resource.kind.toLowerCase(),
                                  resource.name
                                ),
                              ],
                              name: selectedProject.name as string,
                            });
                          }
                        }}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devbox">Devbox</TabsTrigger>
          <TabsTrigger value="cluster">Cluster</TabsTrigger>
          <TabsTrigger value="launchpad">Launchpad</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
