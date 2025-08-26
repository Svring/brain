"use client";

import {
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { Search } from "lucide-react";

interface CommandPanelSearchNodeProps {
  onSelect: (value: string) => void;
}

export function CommandPanelSearchNode({
  onSelect,
}: CommandPanelSearchNodeProps) {
  return (
    <>
      <CommandGroup heading="Search Options">
        <CommandItem value="search-by-name" onSelect={onSelect}>
          <Search className="mr-2 h-4 w-4" />
          <span>Search by Name</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="search-by-type" onSelect={onSelect}>
          <Search className="mr-2 h-4 w-4" />
          <span>Search by Type</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="search-by-tag" onSelect={onSelect}>
          <Search className="mr-2 h-4 w-4" />
          <span>Search by Tag</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="search-by-status" onSelect={onSelect}>
          <Search className="mr-2 h-4 w-4" />
          <span>Search by Status</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
