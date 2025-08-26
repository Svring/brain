"use client";

import {
  Plus,
  Trash2,
  Settings,
  Link,
  Search,
  FolderPlus,
  FolderOpen,
  ChevronRight,
  Eye,
} from "lucide-react";
import {
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";

interface CommandPanelMainProps {
  onSelect: (value: string) => void;
  onHover?: (value: string | null) => void;
  onKeyboardSelect?: (value: string | null) => void;
}

export function CommandPanelMain({
  onSelect,
  onHover,
  onKeyboardSelect,
}: CommandPanelMainProps) {
  return (
    <>
      <CommandGroup heading="Project">
        <CommandItem
          value="add-resource"
          onSelect={onSelect}
          onFocus={() => onKeyboardSelect?.("add-resource")}
          onBlur={() => onKeyboardSelect?.(null)}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Add Resource</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>

        <CommandItem value="remove-resource" onSelect={onSelect}>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Remove Resource</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>

        <CommandItem value="manage-resource" onSelect={onSelect}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Manage Resource</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>

        <CommandItem value="connect-resource" onSelect={onSelect}>
          <Link className="mr-2 h-4 w-4" />
          <span>Connect Resource</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>

        <CommandItem value="display-env" onSelect={onSelect}>
          <Eye className="mr-2 h-4 w-4" />
          <span>Display Environment</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>

        <CommandItem value="manage-status" onSelect={onSelect}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Manage Status</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>

        <CommandItem value="add-new" onSelect={onSelect}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Add New Resource</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Flowgraph">
        <CommandItem value="search-node" onSelect={onSelect}>
          <Search className="mr-2 h-4 w-4" />
          <span>Search Node</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="General">
        <CommandItem value="create-project" onSelect={onSelect}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <span>Create New Project</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>

        <CommandItem value="go-to-project" onSelect={onSelect}>
          <FolderOpen className="mr-2 h-4 w-4" />
          <span>Go to Project</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </CommandItem>
      </CommandGroup>
    </>
  );
}
