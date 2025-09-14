"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import ClusterDropdownMenu from "@/components/chat/messages/system-messages/cluster/components/universal/cluster-dropdown-menu";


export default function ClusterNodeMenu({ object }: { object: ClusterObject }) {
  const { name: clusterName } = object;

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
      <ClusterDropdownMenu
        object={object}
        onDelete={(clusterName) => {
          // Handle delete callback if needed
          console.log("Delete cluster:", clusterName);
        }}
      />
    </DropdownMenu>
  );
}
