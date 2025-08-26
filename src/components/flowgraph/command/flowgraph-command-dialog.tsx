"use client";

import { useState } from "react";
import { Search, Plus, Settings, Trash2, Eye, Edit2, ArrowLeft } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useProjectActions, useProjectState } from "@/contexts/project/project-context";
import { useFlowgraphActions } from "@/contexts/flowgraph/flowgraph-context";
import type { Node } from "@xyflow/react";

interface FlowgraphCommandDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlowgraphCommandDialog({ isOpen, onOpenChange }: FlowgraphCommandDialogProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { selectedProject } = useProjectState();
  const { clearSelectedProject } = useProjectActions();
  const { addNode, setNodes, setEdges } = useFlowgraphActions();

  const handleSelect = (value: string) => {
    switch (value) {
      case "add-node":
        // Add a new node to the flowgraph
        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: "default",
          position: { x: 100, y: 100 },
          data: { label: "New Node" },
        };
        addNode(newNode);
        break;
      
      case "clear-canvas":
        // Clear all nodes and edges
        setNodes([]);
        setEdges([]);
        break;
      
      case "fit-view":
        // Trigger fit view (this would need to be implemented in the flowgraph context)
        break;
      
      case "back-to-projects":
        clearSelectedProject();
        router.push("/projects");
        break;
      
      case "project-settings":
        // Navigate to project settings (if available)
        break;
      
      case "export-flow":
        // Export the current flow
        break;
      
      case "import-flow":
        // Import a flow
        break;
    }
    
    onOpenChange(false);
    setSearch("");
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search commands..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>
        
        <CommandGroup heading="Flow Actions">
          <CommandItem value="add-node" onSelect={handleSelect}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add Node</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          
          <CommandItem value="clear-canvas" onSelect={handleSelect}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Clear Canvas</span>
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          
          <CommandItem value="fit-view" onSelect={handleSelect}>
            <Eye className="mr-2 h-4 w-4" />
            <span>Fit View</span>
            <CommandShortcut>⌘F</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Project">
          <CommandItem value="back-to-projects" onSelect={handleSelect}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to Projects</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          
          <CommandItem value="project-settings" onSelect={handleSelect}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Project Settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Import/Export">
          <CommandItem value="export-flow" onSelect={handleSelect}>
            <span>Export Flow</span>
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          
          <CommandItem value="import-flow" onSelect={handleSelect}>
            <span>Import Flow</span>
            <CommandShortcut>⌘I</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
