"use client";

import { FolderOpen, CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";

interface CommandPanelGoToProjectProps {
  onSelect: (value: string) => void;
}

export function CommandPanelGoToProject({ onSelect }: CommandPanelGoToProjectProps) {
  return (
    <>
      <CommandGroup heading="Navigation Options">
        <CommandItem value="go-to-recent" onSelect={onSelect}>
          <FolderOpen className="mr-2 h-4 w-4" />
          <span>Go to Recent Project</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="go-to-favorites" onSelect={onSelect}>
          <FolderOpen className="mr-2 h-4 w-4" />
          <span>Go to Favorites</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="go-to-all-projects" onSelect={onSelect}>
          <FolderOpen className="mr-2 h-4 w-4" />
          <span>Go to All Projects</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="go-to-project-by-name" onSelect={onSelect}>
          <FolderOpen className="mr-2 h-4 w-4" />
          <span>Go to Project by Name</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
