"use client";

import { Database, Server, Globe, Cpu, CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";

interface CommandPanelAddResourceProps {
  onSelect: (value: string) => void;
}

export function CommandPanelAddResource({ onSelect }: CommandPanelAddResourceProps) {
  return (
    <>
      <CommandGroup heading="Resource Types">
        <CommandItem value="add-database" onSelect={onSelect}>
          <Database className="mr-2 h-4 w-4" />
          <span>Database</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="add-server" onSelect={onSelect}>
          <Server className="mr-2 h-4 w-4" />
          <span>Server</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="add-network" onSelect={onSelect}>
          <Globe className="mr-2 h-4 w-4" />
          <span>Network</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="add-compute" onSelect={onSelect}>
          <Cpu className="mr-2 h-4 w-4" />
          <span>Compute</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
