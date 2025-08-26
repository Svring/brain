"use client";

import { ArrowUpLeft } from "lucide-react";
import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command";

interface CommandNavigationProps {
  onSelect: (value: string) => void;
}

export function CommandNavigation({ onSelect }: CommandNavigationProps) {
  return (
    <CommandGroup>
      <CommandItem value="back-to-main" onSelect={onSelect}>
        <ArrowUpLeft className="mr-2 h-4 w-4" />
        <span>Back to main menu</span>
        <CommandShortcut>⌘[</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  );
}
