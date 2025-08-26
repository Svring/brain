"use client";

import { FolderPlus, CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";

interface CommandPanelCreateProjectProps {
  onSelect: (value: string) => void;
}

export function CommandPanelCreateProject({ onSelect }: CommandPanelCreateProjectProps) {
  return (
    <>
      <CommandGroup heading="Create Options">
        <CommandItem value="create-empty-project" onSelect={onSelect}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <span>Create Empty Project</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="create-from-template" onSelect={onSelect}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <span>Create from Template</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="create-from-scratch" onSelect={onSelect}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <span>Create from Scratch</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="create-from-git" onSelect={onSelect}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <span>Create from Git</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
