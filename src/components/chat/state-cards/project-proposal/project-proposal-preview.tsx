"use client";

import React, { useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import nodeTypes from "@/components/flowgraph/node/node-types";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import { convertProposalToPreviewNodes } from "@/lib/flowgraph/nodes/flowgraph-preview-utils";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";
import { objectStorageCreateSchema } from "@/schemas/forms/objectstorage/objectstorage-create-form-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { nanoid } from "@/lib/utils";

interface ProjectProposalPreviewProps {
  proposal: ProjectProposal;
  className?: string;
}

function ProjectProposalPreviewInner({
  proposal,
  className,
}: ProjectProposalPreviewProps) {
  // Convert proposal to preview nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => convertProposalToPreviewNodes(proposal),
    [proposal]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // Get tRPC clients
  const { devbox, cluster, launchpad, objectstorage, project } =
    useTRPCClients();

  // Create mutations
  const createProjectMutation = useMutation(
    project.createProject.mutationOptions()
  );
  const createDevboxMutation = useMutation(
    devbox.createDevbox.mutationOptions()
  );
  const createClusterMutation = useMutation(
    cluster.createCluster.mutationOptions()
  );
  const createLaunchpadMutation = useMutation(
    launchpad.createLaunchpad.mutationOptions()
  );
  const createObjectStorageMutation = useMutation(
    objectstorage.createObjectStorage.mutationOptions()
  );
  const addToProjectMutation = useMutation(
    project.addToProject.mutationOptions()
  );

  // Handle project creation
  const handleCreate = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);
      console.log("🚀 Starting project creation process", {
        proposal,
        resourceCounts: {
          devbox: proposal.resources.devbox?.length || 0,
          database: proposal.resources.database?.length || 0,
          bucket: proposal.resources.bucket?.length || 0,
          app: proposal.resources.app?.length || 0,
        },
      });

      // 1. Create the project first
      const sanitizedName = proposal.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");

      const uniqueProjectName = `${sanitizedName}-${nanoid()}`;
      console.log(
        "📁 Creating project:",
        proposal.name,
        "-> unique name:",
        uniqueProjectName
      );

      const projectResult = await createProjectMutation.mutateAsync({
        name: uniqueProjectName,
      });

      const projectName = projectResult.name;
      console.log("✅ Project created successfully:", projectName);

      // 2. Create all resources in parallel
      const resourcePromises: Promise<any>[] = [];

      // Create DevBoxes
      if (proposal.resources.devbox?.length) {
        for (const devboxProposal of proposal.resources.devbox) {
          const uniqueDevboxName = `${devboxProposal.name}-${nanoid()}`;
          const devboxData = devboxCreateFormSchema.parse({
            name: uniqueDevboxName,
            runtime: devboxProposal.runtime,
            ports: devboxProposal.ports?.map((port) => ({
              number: port.number,
              protocol: "HTTP" as const,
              exposesPublicDomain: port.publicAccess,
            })),
          });

          resourcePromises.push(
            createDevboxMutation.mutateAsync(devboxData).then((result) => ({
              type: "devbox",
              target: convertResourceTypeToTarget("devbox", uniqueDevboxName),
              result,
              success: true,
            }))
          );
        }
      }

      // Create Databases (Clusters)
      if (proposal.resources.database?.length) {
        for (const databaseProposal of proposal.resources.database) {
          const uniqueDatabaseName = `${databaseProposal.name}-${nanoid()}`;
          const clusterData = clusterCreateFormSchema.parse({
            name: uniqueDatabaseName,
            type: databaseProposal.type as any,
          });

          resourcePromises.push(
            createClusterMutation.mutateAsync(clusterData).then((result) => ({
              type: "cluster",
              target: convertResourceTypeToTarget(
                "cluster",
                uniqueDatabaseName
              ),
              result,
              success: true,
            }))
          );
        }
      }

      // Create Object Storage Buckets
      if (proposal.resources.bucket?.length) {
        for (const bucketProposal of proposal.resources.bucket) {
          const uniqueBucketName = `${bucketProposal.name}-${nanoid()}`;
          const objectStorageData = objectStorageCreateSchema.parse({
            name: uniqueBucketName,
            policy: bucketProposal.policy,
          });

          resourcePromises.push(
            createObjectStorageMutation
              .mutateAsync({
                bucketName: objectStorageData.name,
                bucketPolicy: objectStorageData.policy as
                  | "private"
                  | "publicRead"
                  | "publicReadWrite",
              })
              .then((result) => ({
                type: "objectstorage",
                target: convertResourceTypeToTarget(
                  "objectstoragebucket",
                  uniqueBucketName
                ),
                result,
                success: true,
              }))
          );
        }
      }

      // Create Apps (Launchpads)
      if (proposal.resources.app?.length) {
        for (const appProposal of proposal.resources.app) {
          const uniqueAppName = `${appProposal.name}-${nanoid()}`;
          const launchpadData = launchpadCreateFormSchema.parse({
            name: uniqueAppName,
            image: appProposal.image,
            ports: appProposal.ports?.map((port) => ({
              port: port.number,
              protocol: "TCP" as const,
              appProtocol: "HTTP" as const,
              exposesPublicDomain: port.publicAccess,
            })),
            env: appProposal.env,
          });

          resourcePromises.push(
            createLaunchpadMutation
              .mutateAsync(launchpadData)
              .then((result) => ({
                type: "launchpad",
                target: convertResourceTypeToTarget(
                  "deployment",
                  uniqueAppName
                ),
                result,
                success: true,
              }))
          );
        }
      }

      // Wait for all resources to be created
      const resourceResults = await Promise.allSettled(resourcePromises);
      const allFulfilledResources = resourceResults
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);

      const successfulResources = allFulfilledResources.filter(
        (resource) => resource.success !== false
      );
      const failedResources = resourceResults
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected"
        )
        .map((result) => result.reason);

      if (failedResources.length > 0) {
        console.error("Some resources failed to create:", failedResources);
        toast.error(
          `Created project but ${failedResources.length} resource(s) failed to create`
        );
      }

      // 3. Add all resources to the project
      // Network nodes will be automatically created by the flowgraph system
      // when resources with ports (DevBox, Apps) are added to the project
      if (allFulfilledResources.length > 0) {
        const targets = allFulfilledResources.map(
          (resource) => resource.target
        );
        await addToProjectMutation.mutateAsync({
          resources: targets,
          name: projectName,
        });
        console.log("✅ Resources added to project successfully");
        console.log("🌐 Network nodes will be automatically created for DevBox and App resources with ports");
      }

      console.log("🎉 Project creation completed successfully!");
      toast.success(
        `Project "${projectName}" created successfully with ${successfulResources.length} resource(s)`
      );

      // Navigate to the created project
      router.push(`/projects/${projectName}`);
    } catch (error: any) {
      console.error("💥 Project creation failed:", error);
      toast.error(
        error.message || "Failed to create project. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Check if there are any resources to display
  const hasResources = initialNodes.length > 0;

  if (!hasResources) {
    return (
      <div
        className={`flex items-center justify-center h-64 text-muted-foreground ${
          className || ""
        }`}
      >
        <div className="text-center">
          <p>No resources to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full relative rounded-lg ${className || ""}`}
      style={{ aspectRatio: "16/9" }}
    >
       <ReactFlow
         nodes={nodes}
         edges={edges}
         onNodesChange={onNodesChange}
         onEdgesChange={onEdgesChange}
         nodeTypes={nodeTypes}
         edgeTypes={edgeTypes}
         fitView
         fitViewOptions={REACT_FLOW_CONFIG.fitViewOptions}
         panOnScroll={true}
         zoomOnScroll={true}
         zoomOnPinch={true}
         panOnDrag={false}
         nodesDraggable={false}
         nodesConnectable={false}
         elementsSelectable={false}
         proOptions={REACT_FLOW_CONFIG.proOptions}
         minZoom={0.1}
         maxZoom={2}
       />

      {/* Create Button - positioned at bottom right */}
      <div className="absolute bottom-0 right-0">
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          className="bg-background-tertiary shadow-none flex items-center gap-2 rounded-tr-none rounded-bl-none text-foreground"
          size="sm"
          variant="ghost"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-theme-blue" />
          )}
          {isCreating ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}

export function ProjectProposalPreview({
  proposal,
  className,
}: ProjectProposalPreviewProps) {
  return (
    <div className="bg-background-tertiary p-0.5 rounded-lg">
      <div className="flex flex-col bg-background-secondary rounded-lg">
        <ReactFlowProvider>
          <ProjectProposalPreviewInner
            proposal={proposal}
            className={className}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
