import { Node, Edge, MarkerType } from "@xyflow/react";
import type {
  ProjectProposal,
  DevBox,
  Database,
  ObjectStorageBucket,
  App,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { applySplitLayout } from "@/lib/flowgraph/layout/split-layout";

/**
 * Convert project proposal data into ReactFlow nodes and edges for preview display.
 * @param proposal Project proposal containing resources to visualize
 * @returns Object containing nodes and edges arrays compatible with React Flow for preview
 */
export const convertProposalToPreviewNodes = (
  proposal: ProjectProposal
): { nodes: Node<any>[]; edges: Edge[] } => {
  const nodes: Node<any>[] = [];
  const edges: Edge[] = [];
  let yOffset = 0;
  const nodeSpacing = 80; // Reduced vertical spacing between nodes
  const sectionSpacing = 30; // Reduced extra spacing between different resource types
  const networkNodeSpacing = 50; // Reduced spacing between resource and network nodes

  // Helper function to create a resource node
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

  // Helper function to create a network node for a resource with ports
  const createNetworkNode = (
    resource: DevBox | App,
    resourceType: "devbox" | "deployment",
    resourceNodeId: string,
    xPosition: number,
    yPosition: number
  ): { networkNode: Node<any>; edge: Edge } => {
    const networkNodeId = `network-${resource.name}`;
    const target = convertResourceTypeToTarget(resourceType, resource.name);

    const networkNode: Node<any> = {
      id: networkNodeId,
      type: "network-preview",
      position: {
        x: xPosition + 300, // Position network node to the right of resource node
        y: yPosition,
      },
      data: { target },
    };

    const edge: Edge = {
      id: `${resourceNodeId}-to-${networkNodeId}`,
      source: resourceNodeId,
      target: networkNodeId,
      type: "floating",
      markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
      animated: true,
    };

    return { networkNode, edge };
  };

  // Helper function to create dependency edges based on reliances
  const createDependencyEdges = (
    app: App,
    appNodeId: string,
    allNodes: Node<any>[]
  ): Edge[] => {
    const dependencyEdges: Edge[] = [];

    if (app.reliances) {
      // Create edges to database dependencies
      if (app.reliances.database) {
        app.reliances.database.forEach((dbName) => {
          const dbNode = allNodes.find(
            (node) =>
              node.type === "database-preview" && node.data.name === dbName
          );
          if (dbNode) {
            dependencyEdges.push({
              id: `${dbNode.id}-to-${appNodeId}`,
              source: dbNode.id,
              target: appNodeId,
              type: "floating",
              markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
              animated: true,
            });
          }
        });
      }

      // Create edges to bucket dependencies
      if (app.reliances.bucket) {
        app.reliances.bucket.forEach((bucketName) => {
          const bucketNode = allNodes.find(
            (node) =>
              node.type === "bucket-preview" && node.data.name === bucketName
          );
          if (bucketNode) {
            dependencyEdges.push({
              id: `${bucketNode.id}-to-${appNodeId}`,
              source: bucketNode.id,
              target: appNodeId,
              type: "floating",
              markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
              animated: true,
            });
          }
        });
      }
    }

    return dependencyEdges;
  };

  let resourceTypeIndex = 0;

  // Process DevBoxes
  if (proposal.resources.devbox && proposal.resources.devbox.length > 0) {
    const devboxNodes = proposal.resources.devbox.map((devbox, index) => {
      const node = createNode(devbox, "devbox", index, resourceTypeIndex);
      // Assign DevBox nodes to the devbox group
      return { ...node, parentId: "devbox-group" };
    });
    nodes.push(...devboxNodes);

    // Create network nodes for DevBoxes with ports
    proposal.resources.devbox.forEach((devbox, index) => {
      if (devbox.ports && devbox.ports.length > 0) {
        const resourceNode = devboxNodes[index];
        const { networkNode, edge } = createNetworkNode(
          devbox,
          "devbox",
          resourceNode.id,
          resourceNode.position.x,
          resourceNode.position.y
        );
        // Assign network nodes to the same group as their parent DevBox
        const networkNodeWithParent = {
          ...networkNode,
          parentId: "devbox-group",
        };
        nodes.push(networkNodeWithParent);
        edges.push(edge);
      }
    });

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

    // Create network nodes for Apps with ports
    proposal.resources.app.forEach((app, index) => {
      if (app.ports && app.ports.length > 0) {
        const resourceNode = appNodes[index];
        const { networkNode, edge } = createNetworkNode(
          app,
          "deployment",
          resourceNode.id,
          resourceNode.position.x,
          resourceNode.position.y
        );
        nodes.push(networkNode);
        edges.push(edge);
      }
    });
  }

  // Create dependency edges for Apps based on reliances
  if (proposal.resources.app && proposal.resources.app.length > 0) {
    proposal.resources.app.forEach((app, index) => {
      const appNodeId = `app-${app.name}-${index}`;
      const dependencyEdges = createDependencyEdges(app, appNodeId, nodes);
      edges.push(...dependencyEdges);
    });
  }

  // Add a group node for split layout using the actual DevGroupNode
  const groupNode: Node<any> = {
    id: "devbox-group",
    type: "devgroup",
    position: { x: 0, y: 0 },
    style: {
      width: 400,
      height: 300,
    },
    data: {},
  };

  // Add group node to the beginning of nodes array
  nodes.unshift(groupNode);

  // Apply split layout to organize the nodes using smaller gaps for preview
  const LAYOUT_OPTIONS = {
    direction: "BT",
    rankSep: 80, // Reduced from 150
    nodeSep: 80, // Reduced from 150
  } as const;
  const layoutedNodes = applySplitLayout(nodes, edges, {
    groupId: "devbox-group",
    groupPadding: 15, // Reduced from 20
    gapBetweenGroupAndRest: 120, // Reduced from 200
    groupPosition: { x: -500, y: 0 }, // Adjusted for smaller gap
    childNodeWidth: 160, // Preview nodes are smaller than real nodes (280)
    childNodeHeight: 120, // Preview nodes are smaller than real nodes (200)
    // Account for smaller network preview nodes inside the group
    getChildNodeSize: (node: Node) => {
      if (node.type === "network-preview") {
        return { width: 160, height: 56 }; // h-14 in Tailwind = 56px
      }
      return { width: 160, height: 120 };
    },
    // Treat network preview nodes as shorter than default nodes during outside layout
    getOutsideNodeSize: (node: Node) => {
      if (node.type === "network-preview") {
        return { width: 160, height: 56 }; // h-14 in Tailwind = 56px
      }
      return { width: 160, height: 120 };
    },
    groupLayoutOptions: {
      ...LAYOUT_OPTIONS,
      edgeAware: true,
      barycentricIterations: 3,
    },
    outsideLayoutOptions: {
      ...LAYOUT_OPTIONS,
      edgeAware: true,
      barycentricIterations: 3,
    },
  });

  return { nodes: layoutedNodes, edges };
};
