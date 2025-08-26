"use client";

import { Plus, Settings, Trash2, Eye, ArrowLeft, ChevronRight } from "lucide-react";
import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";

interface CommandPanelMainProps {
  onSelect: (value: string) => void;
}

export function CommandPanelMain({ onSelect }: CommandPanelMainProps) {
  return (
    <>
      <CommandGroup heading="Flow Actions">
        <CommandItem value="add-node" onSelect={onSelect}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Add Node</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>

        <CommandItem value="clear-canvas" onSelect={onSelect}>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Clear Canvas</span>
          <CommandShortcut>⌘K</CommandShortcut>
        </CommandItem>

        <CommandItem value="fit-view" onSelect={onSelect}>
          <Eye className="mr-2 h-4 w-4" />
          <span>Fit View</span>
          <CommandShortcut>⌘F</CommandShortcut>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Project">
        <CommandItem value="back-to-projects" onSelect={onSelect}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back to Projects</span>
          <CommandShortcut>⌘B</CommandShortcut>
        </CommandItem>

        <CommandItem value="project-settings" onSelect={onSelect}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Project Settings</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Import/Export">
        <CommandItem value="import-export" onSelect={onSelect}>
          <span>Import/Export</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>
      </CommandGroup>
    </>
  );
}
