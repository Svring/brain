"use client";

import { Command } from "lucide-react";

interface FlowgraphMenuActionsProps {
  onOpen: () => void;
}

export function FlowgraphMenuActions({ onOpen }: FlowgraphMenuActionsProps) {
  return (
    <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
      {/* <p className="text-muted-foreground">
        Press{" "}
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono font-medium opacity-100 select-none">
          <span className="text-lg">⌘</span>K
        </kbd>
      </p> */}
      <button
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-background-secondary border"
        onClick={onOpen}
        type="button"
      >
        <Command className="h-4 w-4" />
        <span className="sr-only">Command</span>
      </button>
    </div>
  );
}
