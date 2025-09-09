"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DevboxDropdownMenu from "@/components/chat/messages/system-messages.tsx/devbox/components/universal/devbox-dropdown-menu";

export default function DevboxNodeMenu({ object }: { object: DevboxObject }) {
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const { devbox } = useTRPCClients();
  const queryClient = useQueryClient();

  const deleteDevboxMutation = useMutation({
    ...devbox.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devbox"] });
    },
  });

  const { name: devboxName, status } = object;

  return (
    <>
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
        <DevboxDropdownMenu
          object={object}
          onDelete={(devboxName) => {
            setOpen(false);
            setAlertOpen(true);
          }}
        />
      </DropdownMenu>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Devbox</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{devboxName}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                deleteDevboxMutation.mutate(devboxName);
                setAlertOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
