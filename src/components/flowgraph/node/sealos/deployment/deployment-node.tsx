"use client";

import BaseNode from "../../base-node-wrapper";
// import useDeploymentNode from "@/hooks/sealos/deployment/use-deployment-node";
import { Package } from "lucide-react";
import NodeStatusLight from "../node-components/node-status-light";
import NodeInternalUrl from "../node-components/node-internal-url";
import NodePods from "../node-components/node-pods";
import NodeMonitor from "../node-components/node-monitor";
import DeploymentNodeTitle from "./deployment-node-title";
import DeploymentNodeMenu from "./deployment-node-menu";
import { DeploymentObject } from "@/lib/sealos/resources/deployment/deployment-object-schema";
import { useEffect, useMemo } from "react";
import {
  useFlowgraphActions,
  useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import type { Edge, Node } from "@xyflow/react";

// TODO: The derived nodes caused inifinite call stack, need to investigate.
export default function DeploymentNode({ data }: { data: DeploymentObject }) {
  const { name, image, status, ports, pods } = data;

  const { nodes, edges } = useFlowgraphState();
  const { setNodes, setEdges } = useFlowgraphActions();

  // Build ingress nodes/edges derived from deployment ports
  const derived = useMemo(() => {
    const newNodes: Node<any>[] = [];
    const newEdges: Edge[] = [];

    if (!ports || ports.length === 0) return { newNodes, newEdges };

    for (const p of ports) {
      const ingressName = p.name || `${p.protocol?.toLowerCase() || "port"}-${p.number}`;
      const ingressNodeId = `ingress-${ingressName}-of-${name}`;
      const deploymentNodeId = `deployment-${name}`;
      const edgeId = `deployment-${name}-to-${ingressNodeId}`;

      // Node data shape expected by IngressNode component
      const ingressData = {
        object: {
          number: p.number,
          name: ingressName,
          nodePort: p.nodePort as number | undefined,
          protocol: p.protocol,
          serviceName: p.serviceName as string | undefined,
          privateAddress: p.privateAddress as string | undefined,
          publicAddress: p.publicAddress as string | undefined,
        },
        parent: data,
      };

      // Append node if missing
      if (!nodes.some((n) => n.id === ingressNodeId)) {
        newNodes.push({
          id: ingressNodeId,
          type: "ingress",
          position: { x: 0, y: 0 },
          data: ingressData,
        });
      }

      // Append edge if missing
      if (!edges.some((e) => e.id === edgeId)) {
        newEdges.push({
          id: edgeId,
          source: deploymentNodeId,
          target: ingressNodeId,
          type: "step",
          animated: true,
        });
      }
    }

    return { newNodes, newEdges };
  }, [ports, data]);

  // Minimal effect: commit derived nodes/edges once available
  useEffect(() => {
    const { newNodes, newEdges } = derived;
    if ((newNodes.length || newEdges.length) && (nodes.length || edges.length)) {
      if (newNodes.length) setNodes([...nodes, ...newNodes]);
      if (newEdges.length) setEdges([...edges, ...newEdges]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derived]);

  return (
    <BaseNode nodeData={data}>
      <div className="flex h-full flex-col gap-2 justify-between">
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <DeploymentNodeTitle name={name} />
          <DeploymentNodeMenu object={data} />
        </div>

        {/* Image with Package Icon */}
        <div className="flex items-center gap-2 mt-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground truncate flex-1">
            Image: {image}
          </div>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight
            status={
              status.unavailableReplicas !== undefined &&
              status.unavailableReplicas > 0
                ? "Error"
                : "Running"
            }
          />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            <NodeInternalUrl ports={ports || []} />
            <NodePods pods={pods || []} />
            <NodeMonitor />
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
