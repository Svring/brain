"use client";

import { Background, BackgroundVariant, ReactFlow } from "@xyflow/react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { MenuBar } from "@/components/app/project/menu-bar";

import "@xyflow/react/dist/style.css";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="relative h-screen w-full">
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
      </div>
    </Suspense>
  );
}
