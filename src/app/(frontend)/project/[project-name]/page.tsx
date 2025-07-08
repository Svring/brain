"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ReactFlow,
} from "@xyflow/react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { MenuBar } from "@/components/app/project/menu-bar";
import edgeTypes from "@/components/flow/edge/edge-types";
import nodeTypes from "@/components/flow/node/node-types";
import { useProjectResources } from "@/hooks/app/project/use-project-resources";
import { useFlow } from "@/hooks/flow/use-flow";

import "@xyflow/react/dist/style.css";

function ProjectFloatingUI() {
  return (
    <>
      {/* MenuBar in the upper left corner */}
      <div className="absolute top-4 left-4 z-20">
        <MenuBar
          activeIndex={null}
          items={[
            {
              icon: ArrowLeft,
              label: "Back to Home",
              onClick: undefined,
              isToggle: false,
            },
          ]}
        />
        <Link
          aria-label="Back to Home"
          className="absolute inset-0 z-30 h-10 w-10"
          href="/"
          tabIndex={0}
        />
      </div>
      {/* MenuBar in the upper right corner */}
      <div className="absolute top-4 right-4 z-20">
        <MenuBar
          activeIndex={null}
          items={[
            {
              icon: Plus,
              label: "Add New",
              onClick: undefined,
              isToggle: false,
            },
          ]}
        />
      </div>
    </>
  );
}

function ProjectFlow({ projectName }: { projectName: string }) {
  const { data: resources } = useProjectResources(projectName);
  const [nodes, onNodesChange, edges, onEdgesChange] = useFlow(resources);

  return (
    <ReactFlow
      connectionLineType={ConnectionLineType.SmoothStep}
      edges={edges}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.1,
        maxZoom: 1.0,
      }}
      nodes={nodes}
      nodeTypes={nodeTypes}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      panOnScroll
    >
      <Background gap={60} size={1} variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ "project-name": string }>;
}) {
  const { "project-name": projectName } = use(params);
  return (
    <div className="relative h-screen w-full">
      <ProjectFloatingUI />
      <ProjectFlow projectName={projectName} />
    </div>
  );
}
