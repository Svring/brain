"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Play,
  Square,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";
import type { DevboxInfo } from "@/lib/sealos/devbox/schemas";
import {
  useManageDevboxLifecycleMutation,
  useDeleteDevboxMutation,
} from "@/lib/sealos/devbox/devbox-method/devbox-mutation";
import { createDevboxContext } from "@/lib/auth/auth-utils";
import { useState } from "react";
import { toast } from "sonner";

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case "running":
      return "default";
    case "stopped":
      return "secondary";
    case "pending":
      return "outline";
    case "error":
      return "destructive";
    default:
      return "secondary";
  }
}

function formatMemory(memory: number) {
  if (memory >= 1024) {
    return `${(memory / 1024).toFixed(1)}GB`;
  }
  return `${memory}MB`;
}

function DevboxActions({ devbox }: { devbox: DevboxInfo }) {
  const [isLoading, setIsLoading] = useState(false);
  const context = createDevboxContext();
  const lifecycleMutation = useManageDevboxLifecycleMutation(context);
  const deleteMutation = useDeleteDevboxMutation(context);

  const isRunning = devbox.status.toLowerCase() === "running";

  const handleLifecycleAction = async (action: "start" | "stop") => {
    setIsLoading(true);
    try {
      await lifecycleMutation.mutateAsync({
        devboxName: devbox.name,
        action,
      });
      toast.success(`DevBox ${action}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} DevBox`);
      console.error(`Failed to ${action} devbox:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete DevBox "${devbox.name}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteMutation.mutateAsync(devbox.name);
      toast.success("DevBox deleted successfully");
    } catch (error) {
      toast.error("Failed to delete DevBox");
      console.error("Failed to delete devbox:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <span className="sr-only">Open menu</span>
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <MoreHorizontal className="h-3 w-3" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isRunning ? (
          <DropdownMenuItem
            onClick={() => handleLifecycleAction("stop")}
            disabled={isLoading}
          >
            <Square className="mr-2 h-3 w-3" />
            Stop
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => handleLifecycleAction("start")}
            disabled={isLoading}
          >
            <Play className="mr-2 h-3 w-3" />
            Start
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={handleDelete}
          disabled={isLoading}
        >
          <Trash2 className="mr-2 h-3 w-3" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<DevboxInfo>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="h-3 w-3"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="h-3 w-3"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={getStatusVariant(status)} className="text-xs">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "imageName",
    header: "Image",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {row.getValue("imageName")}
      </div>
    ),
  },
  {
    accessorKey: "cpu",
    header: "CPU",
    cell: ({ row }) => (
      <div className="text-xs">{row.getValue("cpu")} cores</div>
    ),
  },
  {
    accessorKey: "memory",
    header: "Memory",
    cell: ({ row }) => (
      <div className="text-xs">{formatMemory(row.getValue("memory"))}</div>
    ),
  },
  {
    accessorKey: "createTime",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {new Date(row.getValue("createTime")).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <DevboxActions devbox={row.original} />,
  },
];
