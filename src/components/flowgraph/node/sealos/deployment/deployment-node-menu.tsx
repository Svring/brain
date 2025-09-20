"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { DeploymentObject } from "@/lib/sealos/resources/deployment/deployment-object-schema";
import LaunchpadDropdownMenu from "@/components/chat/messages/system-messages/launchpad/components/universal/launchpad-dropdown-menu";

export default function DeploymentNodeMenu({
  object,
}: {
  object: DeploymentObject;
}) {
  const [open, setOpen] = React.useState(false);

  const { name } = object;

  // Don't render if we don't have a valid name
  if (!name) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
      <LaunchpadDropdownMenu
        object={{
          name: object.name,
          status: object.status || "Pending",
          resource: object.resource,
        }}
        onDelete={(name) => {
          // 只关闭下拉菜单，LaunchpadDropdownMenu已经处理了删除确认
          setOpen(false);
        }}
        showRestart={true}
      />
    </DropdownMenu>
  );
}
