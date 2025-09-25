import type { Node, Edge } from "@xyflow/react";
import type {
  ResourceObject,
  ResourceReliances,
} from "@/lib/sealos/services/reliances/reliances-schema";
import { inferRelianceFromEnv } from "@/lib/sealos/services/reliances/env-reliance";
import { inferRelianceFromImage } from "@/lib/sealos/services/reliances/image-reliance";
import { MarkerType } from "@xyflow/react";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { applyLayout as applyNormalLayout } from "@/lib/flowgraph/layout/normal-layout";
import { applySplitLayout } from "@/lib/flowgraph/layout/split-layout";
import type { LayoutOptions } from "@/lib/flowgraph/layout/types";
import _ from "lodash";

export const convertObjectsToNodes = (objects: ResourceObject[]): Node[] =>
  _.map(objects, ({ name, kind }) => ({
    id: `${kind.toLowerCase()}-${name}`,
    type: kind.toLowerCase(),
    position: { x: 0, y: 0 },
    data: { name, kind },
  }));

export const inferObjectsReliances = (
  objects: ResourceObject[]
): ResourceReliances => {
  // Custom merge function to avoid TypeError when merging non-iterable values
  const mergeReliances = (
    envReliances: ResourceReliances,
    imageReliances: ResourceReliances
  ): ResourceReliances =>
    _.mergeWith({ ...envReliances }, imageReliances, (objValue, srcValue) => {
      // Only merge arrays, otherwise return undefined to use default merge
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return _.uniqBy(
          [...objValue, ...srcValue],
          (r) => `${r.kind}-${r.name}`
        );
      }
      // If only one is array, return the array
      if (Array.isArray(objValue)) return objValue;
      if (Array.isArray(srcValue)) return srcValue;
      // Otherwise, use default merge (return undefined)
      return undefined;
    });

  return mergeReliances(
    inferRelianceFromEnv(objects),
    inferRelianceFromImage(objects)
  );
};

export const convertReliancesToEdges = (reliances: ResourceReliances): Edge[] =>
  _.flatMap(Object.entries(reliances), ([ownerKind, ownerResources]) =>
    _.flatMap(Object.entries(ownerResources), ([ownerName, dependencies]) => {
      const target = `${ownerKind.toLowerCase()}-${ownerName}`;
      return _.map(dependencies, (dependency) => ({
        id: `${dependency.kind.toLowerCase()}-${dependency.name}-${target}`,
        source: `${dependency.kind.toLowerCase()}-${dependency.name}`,
        target,
        type: "floating",
        markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
        animated: true,
      }));
    })
  );

export const deriveNetworkNodesAndEdges = (
  objects: ResourceObject[]
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  _.forEach(objects, ({ name, kind, ports }) => {
    if (!ports || !Array.isArray(ports) || ports.length === 0) return;

    const networkNodeId = `network-${name}`;
    const resourceNodeId = `${kind.toLowerCase()}-${name}`;
    const edgeId = `${kind.toLowerCase()}-${name}-to-${networkNodeId}`;

    const networkData = {
      target: convertResourceObjectToTarget({ kind, name }),
    };

    if (!_.some(nodes, { id: networkNodeId })) {
      nodes.push({
        id: networkNodeId,
        type: "network",
        position: { x: 0, y: 0 },
        data: networkData,
      });
    }

    if (!_.some(edges, { id: edgeId })) {
      edges.push({
        id: edgeId,
        source: resourceNodeId,
        target: networkNodeId,
        type: "floating",
        markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
        animated: true,
      });
    }
  });

  return { nodes, edges };
};

export const createDevGroup = (nodes: Node[], edges: Edge[] = []): Node[] => {
  const devboxNodes = _.filter(nodes, { type: "devbox" });
  if (_.isEmpty(devboxNodes)) return nodes;

  const devboxNames = new Set(
    _.map(devboxNodes, (node) => node.data?.name as string)
  );
  const devboxNodeIds = new Set(_.map(devboxNodes, "id"));

  // Find devbox network nodes
  const devboxNetworkNodes = _.filter(
    nodes,
    (node) =>
      node.type === "network" &&
      node.id.startsWith("network-") &&
      devboxNames.has(node.id.replace("network-", ""))
  );

  // Find cluster nodes that have edges connected to devbox nodes
  const clusterNodesConnectedToDevbox = _.filter(nodes, (node) => {
    if (node.type !== "cluster") return false;

    // Check if this cluster node has any edge connecting to a devbox node
    return _.some(edges, (edge) => {
      const isSourceCluster = edge.source === node.id;
      const isTargetDevbox = devboxNodeIds.has(edge.target);
      const isTargetCluster = edge.target === node.id;
      const isSourceDevbox = devboxNodeIds.has(edge.source);

      return (
        (isSourceCluster && isTargetDevbox) ||
        (isTargetCluster && isSourceDevbox)
      );
    });
  });

  const groupNode: Node = {
    id: "devbox-group",
    type: "devgroup",
    data: { label: "Devbox Group" },
    position: { x: 0, y: 0 },
  };

  const groupedNodes = _.map(
    [...devboxNodes, ...devboxNetworkNodes, ...clusterNodesConnectedToDevbox],
    (node) => ({
      ...node,
      parentId: "devbox-group",
      extent: "parent" as const,
      position: node.position ?? { x: 0, y: 0 },
    })
  );

  const groupedIds = new Set(_.map(groupedNodes, "id"));
  return [
    ..._.filter(nodes, (node) => !groupedIds.has(node.id)),
    groupNode,
    ...groupedNodes,
  ];
};

// Layout options matching the flowgraph machine
const LAYOUT_OPTIONS = { direction: "BT", rankSep: 150, nodeSep: 150 } as const;
const SPLIT_OPTIONS = {
  groupId: "devbox-group",
  groupPadding: 20,
  gapBetweenGroupAndRest: 200,
  groupPosition: { x: -700, y: 0 },
  childNodeWidth: 280,
  childNodeHeight: 200,
  // Account for smaller network nodes inside the group
  // StatefulSet nodes are taller due to hem component
  getChildNodeSize: (node: Node) => {
    if (node.type === "network") {
      return { width: 280, height: 56 };
    }
    if (node.type === "statefulset") {
      return { width: 280, height: 240 }; // h-60 in Tailwind = 240px (hem component height)
    }
    return { width: 280, height: 200 };
  },
  // Treat network nodes as shorter than default nodes during outside layout
  // StatefulSet nodes are taller due to hem component
  getOutsideNodeSize: (node: Node) => {
    if (node.type === "network") {
      return { width: 280, height: 56 }; // h-14 in Tailwind = 56px
    }
    if (node.type === "statefulset") {
      return { width: 280, height: 240 }; // h-60 in Tailwind = 240px (hem component height)
    }
    return { width: 280, height: 200 };
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
} as const;

export const applyLayout = (
  nodes: Node[],
  edges: Edge[] = [],
  options: LayoutOptions = {}
): Node[] => {
  if (nodes.length === 0) return nodes;

  // Check if there's a devbox group node
  const hasDevboxGroup = nodes.some((node) => node.id === "devbox-group");

  if (hasDevboxGroup) {
    // Use split layout for devbox groups with machine's options
    return applySplitLayout(nodes, edges, {
      ...SPLIT_OPTIONS,
      // Allow options to override default settings
      groupLayoutOptions: {
        ...SPLIT_OPTIONS.groupLayoutOptions,
        ...options,
      },
      outsideLayoutOptions: {
        ...SPLIT_OPTIONS.outsideLayoutOptions,
        ...options,
      },
    });
  } else {
    // Use normal layout for regular nodes with machine's options
    return applyNormalLayout(nodes, edges, {
      ...LAYOUT_OPTIONS,
      edgeAware: true,
      barycentricIterations: 3,
      ...options,
    });
  }
};
