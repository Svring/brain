"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  useNodesState,
  useEdgesState,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import nodeTypes from "@/components/flowgraph/node/node-types";
import { convertProposalToPreviewNodes } from "@/lib/flowgraph/nodes/flowgraph-preview-utils";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { REACT_FLOW_CONFIG } from "@/lib/flowgraph/flowgraph-constant/flowgraph-constant-config";

interface ProjectProposalPreviewProps {
  proposal: ProjectProposal;
  className?: string;
}

function ProjectProposalPreviewInner({ proposal, className }: ProjectProposalPreviewProps) {
  // Convert proposal to preview nodes
  const initialNodes = useMemo(() => convertProposalToPreviewNodes(proposal), [proposal]);
  const initialEdges: any[] = []; // No edges needed for preview

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Check if there are any resources to display
  const hasResources = initialNodes.length > 0;

  if (!hasResources) {
    return (
      <div className={`flex items-center justify-center h-64 text-muted-foreground ${className || ""}`}>
        <div className="text-center">
          <p>No resources to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-64 w-full ${className || ""}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={REACT_FLOW_CONFIG.fitViewOptions}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnDrag={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={REACT_FLOW_CONFIG.proOptions}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background
          gap={REACT_FLOW_CONFIG.background.gap}
          size={REACT_FLOW_CONFIG.background.size}
          variant={REACT_FLOW_CONFIG.background.variant}
        />
      </ReactFlow>
    </div>
  );
}

export function ProjectProposalPreview({ proposal, className }: ProjectProposalPreviewProps) {
  return (
    <ReactFlowProvider>
      <ProjectProposalPreviewInner proposal={proposal} className={className} />
    </ReactFlowProvider>
  );
}
