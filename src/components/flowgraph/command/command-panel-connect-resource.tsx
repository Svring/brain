"use client";

import { Link, Network, CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";

interface CommandPanelConnectResourceProps {
  onSelect: (value: string) => void;
}

export function CommandPanelConnectResource({ onSelect }: CommandPanelConnectResourceProps) {
  return (
    <>
      <CommandGroup heading="Connection Types">
        <CommandItem value="connect-database" onSelect={onSelect}>
          <Link className="mr-2 h-4 w-4" />
          <span>Connect Database</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="connect-api" onSelect={onSelect}>
          <Network className="mr-2 h-4 w-4" />
          <span>Connect API</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="connect-service" onSelect={onSelect}>
          <Link className="mr-2 h-4 w-4" />
          <span>Connect Service</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>

        <CommandItem value="connect-external" onSelect={onSelect}>
          <Network className="mr-2 h-4 w-4" />
          <span>Connect External</span>
          <CommandShortcut>Enter</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
