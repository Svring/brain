"use client";

import { Background, BackgroundVariant, ReactFlow } from "@xyflow/react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import React, { use } from "react";
import { MenuBar } from "@/components/app/project/menu-bar";
import { useProjectResources } from "@/hooks/app/project/use-project-resources";
import { processProjectConnections } from "@/lib/app/project/project-utils";
import { convertResourcesToNodes } from "@/lib/flow/nodes/flow-nodes-utils";

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

  // Log env variables of deployments and statefulsets whenever resources change
  React.useEffect(() => {
    if (!resources) {
      return;
    }

    const connections = processProjectConnections(resources);
    // eslint-disable-next-line no-console
    console.log("Project connections:", connections);
    const nodes = convertResourcesToNodes(resources);
    console.log("Nodes:", nodes);
  }, [resources]);

  return (
    <ReactFlow
      fitView
      fitViewOptions={{
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.1,
        maxZoom: 1.0,
      }}
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
