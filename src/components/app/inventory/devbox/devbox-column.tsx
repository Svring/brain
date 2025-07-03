"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { DevboxColumn } from "./devbox-table-schema";

export const devboxColumns: ColumnDef<DevboxColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "template",
    header: "Template",
    cell: ({ row }) => {
      const template = row.getValue("template") as string;
      return <div className="font-medium">{template}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const getStatusVariant = (statusValue: string) => {
        switch (statusValue.toLowerCase()) {
          case "running":
            return "default";
          case "stopped":
            return "secondary";
          case "creating":
            return "outline";
          default:
            return "destructive";
        }
      };

      const getStatusColor = (statusValue: string) => {
        switch (statusValue.toLowerCase()) {
          case "running":
            return "text-green-600";
          case "stopped":
            return "text-gray-600";
          case "creating":
            return "text-blue-600";
          default:
            return "text-red-600";
        }
      };

      return (
        <Badge
          className={getStatusColor(status)}
          variant={getStatusVariant(status)}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return <div className="text-muted-foreground text-sm">{createdAt}</div>;
    },
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => {
      const cost = row.getValue("cost") as string;
      return <div className="font-mono text-sm">{cost}</div>;
    },
  },
  {
    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => {
      const project = row.getValue("project") as string;
      return <div className="font-mono text-sm">{project}</div>;
    },
  },
];
