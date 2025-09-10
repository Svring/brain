"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import DevboxDropdownMenu from "@/components/chat/messages/system-messages.tsx/devbox/components/universal/devbox-dropdown-menu";

export default function DevboxNodeMenu({ object }: { object: DevboxObject }) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DevboxDropdownMenu
        object={object}
        onDelete={(devboxName) => {
          // Handle delete callback if needed
          console.log("Delete devbox:", devboxName);
        }}
      />
    </DropdownMenu>
  );
}
