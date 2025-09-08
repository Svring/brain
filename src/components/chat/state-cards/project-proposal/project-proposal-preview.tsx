"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import nodeTypes from "@/components/flowgraph/node/node-types";
import edgeTypes from "@/components/flowgraph/edge/edge-types";
import { convertProposalToPreviewNodes } from "@/lib/flowgraph/nodes/flowgraph-preview-utils";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";

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

  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <div
      className={`p-0.5 rounded-lg ${className || ""}`}
      style={{ aspectRatio: "16/9" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        preventScrolling={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        panOnDrag={true}
        minZoom={0.1}
        maxZoom={2}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={false}
        selectNodesOnDrag={false}
        {...REACT_FLOW_CONFIG}
      />
    </div>
  );
}

export function ProjectProposalPreview(props: ProjectProposalPreviewProps) {
  return (
    <ReactFlowProvider>
      <ProjectProposalPreviewInner {...props} />
    </ReactFlowProvider>
  );
}
