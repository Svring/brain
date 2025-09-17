import type { Node, Edge } from "@xyflow/react";
import type {
  ResourceObject,
  ResourceReliances,
} from "@/lib/sealos/services/reliances/reliances-schema";
import { inferRelianceFromEnv } from "@/lib/sealos/services/reliances/env-reliance";
import { inferRelianceFromImage } from "@/lib/sealos/services/reliances/image-reliance";
import { MarkerType } from "@xyflow/react";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
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
  const mergeReliances = (
    envReliances: ResourceReliances,
    imageReliances: ResourceReliances
  ): ResourceReliances =>
    _.mergeWith(
      { ...envReliances },
      imageReliances,
      (objValue: any[], srcValue: any[]) =>
        _.uniqBy(
          [...(objValue || []), ...(srcValue || [])],
          (r) => `${r.kind}-${r.name}`
        )
    );

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

export const createDevGroup = (nodes: Node[]): Node[] => {
  const devboxNodes = _.filter(nodes, { type: "devbox" });
  if (_.isEmpty(devboxNodes)) return nodes;

  const devboxNames = new Set(
    _.map(devboxNodes, (node) => node.data?.name as string)
  );
  const devboxNetworkNodes = _.filter(
    nodes,
    (node) =>
      node.type === "network" &&
      node.id.startsWith("network-") &&
      devboxNames.has(node.id.replace("network-", ""))
  );

  const groupNode: Node = {
    id: "devbox-group",
    type: "devgroup",
    data: { label: "Devbox Group" },
    position: { x: 0, y: 0 },
  };

  const groupedNodes = _.map(
    [...devboxNodes, ...devboxNetworkNodes],
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

export const applyLayout = (nodes: Node[]): Node[] => nodes;
