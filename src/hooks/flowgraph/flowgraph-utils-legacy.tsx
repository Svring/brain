// import type { Node, Edge } from "@xyflow/react";
// import type {
//   ResourceObject,
//   ResourceReliances,
// } from "@/lib/sealos/services/reliances/reliances-schema";
// import { inferRelianceFromEnv } from "@/lib/sealos/services/reliances/env-reliance";
// import { inferRelianceFromImage } from "@/lib/sealos/services/reliances/image-reliance";
// import { MarkerType } from "@xyflow/react";
// import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
// import _ from "lodash";

// /**
//  * Convert resource objects to flowgraph nodes
//  * @param objects - Array of resource objects to convert
//  * @returns Array of React Flow nodes
//  */
// export const convertObjectsToNodes = (objects: ResourceObject[]): Node[] => {
//   const nodes: Node[] = [];

//   for (const resourceObject of objects) {
//     const { name, kind } = resourceObject;

//     const id = `${kind.toLowerCase()}-${name}`;
//     const type = kind.toLowerCase();

//     nodes.push({
//       id,
//       type,
//       position: { x: 0, y: 0 },
//       data: resourceObject,
//     });
//   }

//   return nodes;
// };

// /**
//  * Infer resource reliances/dependencies from objects
//  * @param objects - Array of resource objects to analyze for dependencies
//  * @returns Object containing resource dependencies grouped by kind and name
//  */
// export const inferObjectsReliances = (
//   objects: ResourceObject[]
// ): ResourceReliances => {
//   /**
//    * Merges two resource reliance objects
//    * @param envReliances Reliances inferred from environment variables
//    * @param imageReliances Reliances inferred from image names
//    * @returns Merged reliances object
//    */
//   function mergeReliances(
//     envReliances: ResourceReliances,
//     imageReliances: ResourceReliances
//   ): ResourceReliances {
//     const merged: ResourceReliances = { ...envReliances };

//     // Merge image reliances into env reliances
//     for (const kind in imageReliances) {
//       if (!merged[kind]) {
//         merged[kind] = {};
//       }

//       for (const resourceName in imageReliances[kind]) {
//         if (!merged[kind][resourceName]) {
//           merged[kind][resourceName] = [];
//         }

//         // Add image-based reliances that don't already exist
//         for (const reliance of imageReliances[kind][resourceName]) {
//           if (
//             !merged[kind][resourceName].some(
//               (r) => r.name === reliance.name && r.kind === reliance.kind
//             )
//           ) {
//             merged[kind][resourceName].push(reliance);
//           }
//         }
//       }
//     }

//     return merged;
//   }

//   const envReliances = inferRelianceFromEnv(objects);
//   const imageReliances = inferRelianceFromImage(objects);

//   return mergeReliances(envReliances, imageReliances);
// };

// /**
//  * Convert reliances to flowgraph edges
//  * @param reliances - Object containing resource dependencies
//  * @returns Array of React Flow edges
//  */
// export const convertReliancesToEdges = (
//   reliances: ResourceReliances
// ): Edge[] => {
//   const edges: Edge[] = [];

//   // Iterate through each owner kind (e.g., "statefulset")
//   for (const [ownerKind, ownerResources] of Object.entries(reliances)) {
//     // Iterate through each owner resource (e.g., "affine-naxuseoz")
//     for (const [ownerName, dependencies] of Object.entries(ownerResources)) {
//       const target = `${ownerKind.toLowerCase()}-${ownerName}`;

//       // For each dependency, create an edge
//       for (const dependency of dependencies) {
//         const source = `${dependency.kind.toLowerCase()}-${dependency.name}`;
//         const id = `${source}-${target}`; // deterministic unique id

//         edges.push({
//           id,
//           source,
//           target,
//           type: "floating",
//           markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
//           animated: true,
//         });
//       }
//     }
//   }

//   return edges;
// };

// /**
//  * Derive network nodes and edges from resource objects
//  * @param objects - Array of resource objects to analyze for network connectivity
//  * @returns Object containing network-related React Flow nodes and edges
//  */
// export const deriveNetworkNodesAndEdges = (
//   objects: ResourceObject[]
// ): { nodes: Node[]; edges: Edge[] } => {
//   const newNodes: Node[] = [];
//   const newEdges: Edge[] = [];

//   for (const resourceObject of objects) {
//     const { name, kind } = resourceObject;

//     // Check if the resource has ports or if it's a resource type that typically has network connectivity
//     const ports = resourceObject.ports;
//     const hasNetworkConnectivity =
//       ports && Array.isArray(ports) && ports.length > 0;

//     // For resources without explicit ports, we'll still create a network node
//     // as the useResourceStatus hook will fetch the latest data and extract ports
//     if (!hasNetworkConnectivity) {
//       // Only skip if we're certain there are no ports
//       continue;
//     }

//     const networkNodeId = `network-${name}`;
//     const resourceNodeId = `${kind.toLowerCase()}-${name}`;
//     const edgeId = `${kind.toLowerCase()}-${name}-to-${networkNodeId}`;

//     // Create target for the parent resource
//     const target = convertResourceObjectToTarget({
//       kind,
//       name,
//     });

//     // Node data shape expected by NetworkNode component
//     const networkData = {
//       target,
//     };

//     // Append network node if missing
//     if (!newNodes.some((n) => n.id === networkNodeId)) {
//       newNodes.push({
//         id: networkNodeId,
//         type: "network",
//         position: { x: 0, y: 0 },
//         data: networkData,
//       });
//     }

//     // Append edge if missing
//     if (!newEdges.some((e) => e.id === edgeId)) {
//       newEdges.push({
//         id: edgeId,
//         source: resourceNodeId,
//         target: networkNodeId,
//         type: "floating",
//         markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
//         animated: true,
//       });
//     }
//   }

//   return { nodes: newNodes, edges: newEdges };
// };

// /**
//  * Groups devbox-related nodes under a parent "devbox-group" node.
//  * @param nodes - Array of nodes to process
//  * @returns Array of nodes with devbox grouping applied
//  */
// export const createDevGroup = (nodes: Node[]): Node[] => {
//   // Find devbox nodes
//   const devboxNodes = nodes.filter((node) => node.type === "devbox");
//   if (!devboxNodes.length) return nodes;

//   // Get devbox names for matching related nodes
//   const devboxNames = new Set(
//     devboxNodes.map((node) => node.data?.name as string).filter((name) => name)
//   );

//   // Find related network nodes (e.g., network-<name>)
//   const devboxNetworkNodes = nodes.filter(
//     (node) =>
//       node.type === "network" &&
//       node.id.startsWith("network-") &&
//       devboxNames.has(node.id.replace("network-", ""))
//   );

//   // Create parent group node
//   const groupNode: Node = {
//     id: "devbox-group",
//     type: "devgroup",
//     data: { label: "Devbox Group" },
//     position: { x: 0, y: 0 },
//   };

//   // Assign parent to devbox and network nodes
//   const groupedNodes = [...devboxNodes, ...devboxNetworkNodes].map((node) => ({
//     ...node,
//     parentId: "devbox-group",
//     extent: "parent" as const,
//     position: node.position ?? { x: 0, y: 0 },
//   }));

//   // Combine non-grouped nodes, group node, and grouped nodes
//   const groupedIds = new Set(groupedNodes.map((node) => node.id));
//   const nonGroupedNodes = nodes.filter((node) => !groupedIds.has(node.id));
//   return [...nonGroupedNodes, groupNode, ...groupedNodes];
// };

// /**
//  * Apply layout to nodes
//  * @param nodes - Array of nodes to apply layout to
//  * @returns Array of nodes with layout applied
//  */
// export const applyLayout = (nodes: Node[]): Node[] => {
//   // TODO: Implement layout application logic
//   return nodes;
// };
