import { Node } from "@xyflow/react";
import type {
  ProjectProposal,
  DevBox,
  Database,
  ObjectStorageBucket,
  App,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

/**
 * Convert project proposal data into ReactFlow nodes for preview display.
 * @param proposal Project proposal containing resources to visualize
 * @returns Array of nodes compatible with React Flow for preview
 */
export const convertProposalToPreviewNodes = (
  proposal: ProjectProposal
): Node<any>[] => {
  const nodes: Node<any>[] = [];
  let yOffset = 0;
  const nodeSpacing = 140; // Vertical spacing between nodes
  const sectionSpacing = 60; // Extra spacing between different resource types

  // Helper function to create a node
  const createNode = (
    resource: DevBox | Database | ObjectStorageBucket | App,
    type: string,
    index: number,
    resourceTypeIndex: number
  ): Node<any> => {
    const nodeId = `${type}-${resource.name}-${index}`;
    const xPosition = (index % 3) * 280; // 3 columns with 280px spacing
    const yPosition = yOffset + Math.floor(index / 3) * nodeSpacing;

    return {
      id: nodeId,
      type: `${type}-preview`,
      position: { x: xPosition, y: yPosition },
      data: resource,
    };
  };

  let resourceTypeIndex = 0;

  // Process DevBoxes
  if (proposal.resources.devbox && proposal.resources.devbox.length > 0) {
    const devboxNodes = proposal.resources.devbox.map((devbox, index) =>
      createNode(devbox, "devbox", index, resourceTypeIndex)
    );
    nodes.push(...devboxNodes);

    // Update yOffset for next resource type
    const rows = Math.ceil(proposal.resources.devbox.length / 3);
    yOffset += rows * nodeSpacing + sectionSpacing;
    resourceTypeIndex++;
  }

  // Process Databases
  if (proposal.resources.database && proposal.resources.database.length > 0) {
    const databaseNodes = proposal.resources.database.map((database, index) =>
      createNode(database, "database", index, resourceTypeIndex)
    );
    nodes.push(...databaseNodes);

    // Update yOffset for next resource type
    const rows = Math.ceil(proposal.resources.database.length / 3);
    yOffset += rows * nodeSpacing + sectionSpacing;
    resourceTypeIndex++;
  }

  // Process Object Storage Buckets
  if (proposal.resources.bucket && proposal.resources.bucket.length > 0) {
    const bucketNodes = proposal.resources.bucket.map((bucket, index) =>
      createNode(bucket, "bucket", index, resourceTypeIndex)
    );
    nodes.push(...bucketNodes);

    // Update yOffset for next resource type
    const rows = Math.ceil(proposal.resources.bucket.length / 3);
    yOffset += rows * nodeSpacing + sectionSpacing;
    resourceTypeIndex++;
  }

  // Process Apps
  if (proposal.resources.app && proposal.resources.app.length > 0) {
    const appNodes = proposal.resources.app.map((app, index) =>
      createNode(app, "app", index, resourceTypeIndex)
    );
    nodes.push(...appNodes);
  }

  return nodes;
};
