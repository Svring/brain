"use client";

import { useRouter } from "next/navigation";
import {
  useProjectActions,
  useProjectState,
} from "@/contexts/project/project-context";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import type { Node } from "@xyflow/react";

interface CommandActionsProps {
  onOpenChange: (open: boolean) => void;
  setCurrentPanel: (panel: "main" | "add-node" | "project-settings" | "import-export") => void;
  setSearch: (search: string) => void;
}

export function useCommandActions({
  onOpenChange,
  setCurrentPanel,
  setSearch,
}: CommandActionsProps) {
  const router = useRouter();
  const { selectedProject } = useProjectState();
  const { clearSelectedProject } = useProjectActions();
  const { addNode, setNodes, setEdges } = useFlowgraphActions();

  const handleSelect = (value: string) => {
    switch (value) {
      case "add-node":
        setCurrentPanel("add-node");
        break;

      case "project-settings":
        setCurrentPanel("project-settings");
        break;

      case "import-export":
        setCurrentPanel("import-export");
        break;

      case "back-to-main":
        setCurrentPanel("main");
        setSearch("");
        break;

      case "add-default-node":
        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: "default",
          position: { x: 100, y: 100 },
          data: { label: "New Node" },
        };
        addNode(newNode);
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "add-resource-node":
        const resourceNode: Node = {
          id: `resource-${Date.now()}`,
          type: "resource",
          position: { x: 200, y: 200 },
          data: { label: "Resource Node" },
        };
        addNode(resourceNode);
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "clear-canvas":
        setNodes([]);
        setEdges([]);
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "back-to-projects":
        clearSelectedProject();
        router.push("/projects");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "export-json":
        // Export flow as JSON
        console.log("Exporting as JSON...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "export-png":
        // Export flow as PNG
        console.log("Exporting as PNG...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "import-json":
        // Import flow from JSON
        console.log("Importing from JSON...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;
    }
  };

  return { handleSelect };
}
