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
  setCurrentPanel: (panel: "main" | "add-resource" | "remove-resource" | "manage-resource" | "connect-resource" | "search-node" | "create-project" | "go-to-project") => void;
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
      // Navigation to panels
      case "add-resource":
        setCurrentPanel("add-resource");
        break;

      case "remove-resource":
        setCurrentPanel("remove-resource");
        break;

      case "manage-resource":
        setCurrentPanel("manage-resource");
        break;

      case "connect-resource":
        setCurrentPanel("connect-resource");
        break;

      case "search-node":
        setCurrentPanel("search-node");
        break;

      case "create-project":
        setCurrentPanel("create-project");
        break;

      case "go-to-project":
        setCurrentPanel("go-to-project");
        break;

      case "back-to-main":
        setCurrentPanel("main");
        setSearch("");
        break;

      // Add resource actions
      case "add-database":
        const dbNode: Node = {
          id: `database-${Date.now()}`,
          type: "database",
          position: { x: 100, y: 100 },
          data: { label: "Database" },
        };
        addNode(dbNode);
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "add-server":
        const serverNode: Node = {
          id: `server-${Date.now()}`,
          type: "server",
          position: { x: 200, y: 200 },
          data: { label: "Server" },
        };
        addNode(serverNode);
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "add-network":
        const networkNode: Node = {
          id: `network-${Date.now()}`,
          type: "network",
          position: { x: 300, y: 300 },
          data: { label: "Network" },
        };
        addNode(networkNode);
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "add-compute":
        const computeNode: Node = {
          id: `compute-${Date.now()}`,
          type: "compute",
          position: { x: 400, y: 400 },
          data: { label: "Compute" },
        };
        addNode(computeNode);
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      // Remove resource actions
      case "remove-selected":
        console.log("Removing selected resources...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "remove-all":
        setNodes([]);
        setEdges([]);
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "remove-by-type":
        console.log("Removing by type...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      // Manage resource actions
      case "view-resource":
        console.log("Viewing resource...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "edit-resource":
        console.log("Editing resource...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "configure-resource":
        console.log("Configuring resource...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "monitor-resource":
        console.log("Monitoring resource...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      // Connect resource actions
      case "connect-database":
        console.log("Connecting database...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "connect-api":
        console.log("Connecting API...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "connect-service":
        console.log("Connecting service...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "connect-external":
        console.log("Connecting external...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      // Search node actions
      case "search-by-name":
        console.log("Searching by name...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "search-by-type":
        console.log("Searching by type...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "search-by-tag":
        console.log("Searching by tag...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "search-by-status":
        console.log("Searching by status...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      // Create project actions
      case "create-empty-project":
        console.log("Creating empty project...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "create-from-template":
        console.log("Creating from template...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "create-from-scratch":
        console.log("Creating from scratch...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "create-from-git":
        console.log("Creating from git...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      // Go to project actions
      case "go-to-recent":
        console.log("Going to recent project...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "go-to-favorites":
        console.log("Going to favorites...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "go-to-all-projects":
        clearSelectedProject();
        router.push("/projects");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;

      case "go-to-project-by-name":
        console.log("Going to project by name...");
        onOpenChange(false);
        setCurrentPanel("main");
        setSearch("");
        break;
    }
  };

  return { handleSelect };
}
