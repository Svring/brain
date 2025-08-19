import { Edge, MarkerType, Node } from "@xyflow/react";

interface ResourceObject {
  name: string;
  kind: string;
  [key: string]: any;
}

interface Port {
  number: number;
  name?: string;
  nodePort?: number;
  protocol?: string;
  serviceName?: string;
  privateAddress?: string;
  publicAddress?: string;
  ingressName?: string;
  host?: string;
}

/**
 * Convert resource objects into React Flow nodes.
 *
 * @param resourceObjects Array of resource objects with name and kind fields.
 * @returns Array of nodes compatible with React Flow.
 */
export const convertResourceObjectsToNodes = (
  resourceObjects: ResourceObject[]
): Node<any>[] => {
  const nodes: Node<any>[] = [];

  for (const resourceObject of resourceObjects) {
    const { name, kind } = resourceObject;
    if (!name || !kind) {
      continue;
    }

    const id = `${kind.toLowerCase()}-${name}`;
    const type = kind.toLowerCase();

    nodes.push({
      id,
      type,
      position: { x: 0, y: 0 },
      data: resourceObject,
    });
  }

  return nodes;
};

/**
 * Convert ports to network nodes and edges for a given resource.
 *
 * @param resourceData Data of the parent resource containing ports
 * @param resourceName Name of the parent resource
 * @param resourceKind Kind of the parent resource
 * @param existingNodes Current nodes in the flowgraph to avoid duplicates
 * @param existingEdges Current edges in the flowgraph to avoid duplicates
 * @returns Object containing new nodes and edges to add
 */
export const convertResourceToNetworkNodes = (
  resourceData: any,
  resourceName: string,
  resourceKind: string,
  existingNodes: Node<any>[],
  existingEdges: Edge[]
): { newNodes: Node<any>[]; newEdges: Edge[] } => {
  const newNodes: Node<any>[] = [];
  const newEdges: Edge[] = [];

  const ports = resourceData.ports;
  if (!ports || ports.length === 0) return { newNodes, newEdges };

  const networkNodeId = `network-${resourceName}`;
  const resourceNodeId = `${resourceKind.toLowerCase()}-${resourceName}`;
  const edgeId = `${resourceKind.toLowerCase()}-${resourceName}-to-${networkNodeId}`;

  // Node data shape expected by NetworkNode component
  const networkData = {
    resource: {
      ports: ports,
    },
    parent: resourceData,
  };

  // Append network node if missing
  if (!existingNodes.some((n) => n.id === networkNodeId)) {
    newNodes.push({
      id: networkNodeId,
      type: "network",
      position: { x: 0, y: 0 },
      data: networkData,
    });
  }

  // Append edge if missing
  if (!existingEdges.some((e) => e.id === edgeId)) {
    newEdges.push({
      id: edgeId,
      source: resourceNodeId,
      target: networkNodeId,
      type: "floating",
      markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
      animated: true,
    });
  }

  return { newNodes, newEdges };
};

/**
 * Convert ports to ingress nodes and edges for a given resource.
 *
 * @param ports Array of port objects
 * @param resourceName Name of the parent resource
 * @param resourceKind Kind of the parent resource
 * @param resourceData Data of the parent resource
 * @param existingNodes Current nodes in the flowgraph to avoid duplicates
 * @param existingEdges Current edges in the flowgraph to avoid duplicates
 * @returns Object containing new nodes and edges to add
 */
export const convertPortsToIngressNodes = (
  ports: Port[] | undefined,
  resourceName: string,
  resourceKind: string,
  resourceData: any,
  existingNodes: Node<any>[],
  existingEdges: Edge[]
): { newNodes: Node<any>[]; newEdges: Edge[] } => {
  const newNodes: Node<any>[] = [];
  const newEdges: Edge[] = [];

  if (!ports || ports.length === 0) return { newNodes, newEdges };

  for (const port of ports) {
    const ingressName =
      port.name || `${port.protocol?.toLowerCase() || "port"}-${port.number}`;
    const ingressNodeId = `ingress-${ingressName}-of-${resourceName}`;
    const resourceNodeId = `${resourceKind.toLowerCase()}-${resourceName}`;
    const edgeId = `${resourceKind.toLowerCase()}-${resourceName}-to-${ingressNodeId}`;

    // Node data shape expected by IngressNode component
    const ingressData = {
      object: {
        number: port.number,
        name: ingressName,
        nodePort: port.nodePort,
        protocol: port.protocol || "TCP",
        serviceName: port.serviceName,
        privateAddress: port.privateAddress,
        publicAddress: port.publicAddress,
      },
      parent: resourceData,
    };

    // Append node if missing
    if (!existingNodes.some((n) => n.id === ingressNodeId)) {
      newNodes.push({
        id: ingressNodeId,
        type: "ingress",
        position: { x: 0, y: 0 },
        data: ingressData,
      });
    }

    // Append edge if missing
    if (!existingEdges.some((e) => e.id === edgeId)) {
      newEdges.push({
        id: edgeId,
        source: resourceNodeId,
        target: ingressNodeId,
        type: "floating",
        markerEnd: { type: MarkerType.Arrow, width: 30, height: 30 },
        animated: true,
      });
    }
  }

  return { newNodes, newEdges };
};
