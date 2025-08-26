import { Edge, MarkerType, Node } from "@xyflow/react";
import { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

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
 * Convert K8sResource objects into React Flow nodes.
 *
 * @param k8sResources Array of K8sResource objects.
 * @returns Array of nodes compatible with React Flow.
 */
export const convertResourceToNodes = (
  k8sResources: K8sResource[]
): Node<any>[] => {
  const nodes: Node<any>[] = [];

  for (const k8sResource of k8sResources) {
    const { metadata, kind } = k8sResource;
    const name = metadata?.name;

    if (!name || !kind) {
      continue;
    }

    const id = `${kind.toLowerCase()}-${name}`;
    const type = kind.toLowerCase();

    nodes.push({
      id,
      type,
      position: { x: 0, y: 0 },
      data: k8sResource,
    });
  }

  return nodes;
};

/**
 * Convert resource to network nodes and edges for a given resource.
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

  // Check if the resource has ports or if it's a resource type that typically has network connectivity
  const ports = resourceData.ports;
  const hasNetworkConnectivity = ports && ports.length > 0;

  // For resources without explicit ports, we'll still create a network node
  // as the useResourceStatus hook will fetch the latest data and extract ports
  if (!hasNetworkConnectivity && !resourceData.spec?.ports) {
    // Only skip if we're certain there are no ports
    return { newNodes, newEdges };
  }

  const networkNodeId = `network-${resourceName}`;
  const resourceNodeId = `${resourceKind.toLowerCase()}-${resourceName}`;
  const edgeId = `${resourceKind.toLowerCase()}-${resourceName}-to-${networkNodeId}`;

  // Create target for the parent resource
  const target = convertResourceObjectToTarget({
    kind: resourceKind,
    name: resourceName,
  });

  // Node data shape expected by NetworkNode component
  const networkData = {
    target,
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

/**
 * Add a parent group node for devbox nodes and move devbox nodes to be children of that group.
 *
 * @param nodes Array of nodes (e.g., from convertResourceObjectsToNodes)
 * @returns Array of nodes with devbox nodes grouped under a parent group node
 */
export const addDevboxToDevGroup = (nodes: Node<any>[]): Node<any>[] => {
  const devboxNodes = nodes.filter((node) => node.type === "devbox");

  if (devboxNodes.length === 0) {
    return nodes;
  }

  // Also include affiliated nodes (e.g., network/ingress) whose parent is a devbox resource
  const devboxNames = new Set(
    devboxNodes
      .map((n) => (n.data?.name as string | undefined) || undefined)
      .filter(Boolean) as string[]
  );

  const affiliatedNodes = nodes.filter((n) => {
    if (n.type !== "network" && n.type !== "ingress") return false;
    const parent = (n as any).data?.parent;
    const parentName: string | undefined = parent?.name;
    const parentKind: string | undefined = parent?.kind?.toLowerCase?.();
    if (parentKind === "devbox" && parentName) return true;
    if (parentName && devboxNames.has(parentName)) return true;
    // Fallback: match by id pattern network-<name> / ingress-*-of-<name>
    if (n.id.startsWith("network-")) {
      const name = n.id.replace(/^network-/, "");
      if (devboxNames.has(name)) return true;
    }
    if (n.id.startsWith("ingress-") && n.id.includes("-of-")) {
      const ofIdx = n.id.lastIndexOf("-of-");
      const name = n.id.slice(ofIdx + 4);
      if (devboxNames.has(name)) return true;
    }
    return false;
  });

  // Create parent group node with calculated dimensions
  const groupNode: Node<any> = {
    id: "devbox-group",
    type: "devgroup",
    data: { label: "Devbox Group" },
    position: { x: 0, y: 0 },
  };

  // Update devbox nodes to be children of the group
  const updatedDevboxNodes = devboxNodes.map((node) => ({
    ...node,
    parentId: "devbox-group",
    extent: "parent" as const,
    // position is recalculated by layout; keep as-is
    position: node.position ?? { x: 0, y: 0 },
  }));

  // Update affiliated nodes (network/ingress) to be children of the group
  const updatedAffiliatedNodes = affiliatedNodes.map((node) => ({
    ...node,
    parentId: "devbox-group",
    extent: "parent" as const,
    position: node.position ?? { x: 0, y: 0 },
  }));

  // Return non-devbox nodes + group node + updated devbox nodes
  const idsToGroup = new Set([
    ...devboxNodes.map((n) => n.id),
    ...affiliatedNodes.map((n) => n.id),
  ]);
  const nonGroupedNodes = nodes.filter((node) => !idsToGroup.has(node.id));
  return [
    ...nonGroupedNodes,
    groupNode,
    ...updatedDevboxNodes,
    ...updatedAffiliatedNodes,
  ];
};
