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
  setSearch: (search: string) => void;
  setSelectedCommand: (command: string | null) => void;
  setIsDetailMode: (isDetail: boolean) => void;
}

export function useCommandActions({
  onOpenChange,
  setSearch,
  setSelectedCommand,
  setIsDetailMode,
}: CommandActionsProps) {
  const router = useRouter();
  const { selectedProject } = useProjectState();
  const { clearSelectedProject } = useProjectActions();
  const { addNode, setNodes, setEdges } = useFlowgraphActions();

  const resetAndClose = () => {
    onOpenChange(false);
    setSearch("");
    setSelectedCommand(null);
    setIsDetailMode(false);
  };

  const handleSelect = (value: string) => {
    switch (value) {
      // Main commands
      case "add-resource":
        // Enter detail view without altering the sidebar
        setSelectedCommand("add-resource");
        setIsDetailMode(true);
        break;
    }
  };

  return { handleSelect };
}
