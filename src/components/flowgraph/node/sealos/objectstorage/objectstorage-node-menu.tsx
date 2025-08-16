"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, PencilLine } from "lucide-react";
import { createK8sContext, createSealosContext } from "@/lib/auth/auth-utils";
import { useDeleteObjectStorageMutation } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-mutation";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";
import { useRemoveFromProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

export default function ObjectStorageNodeMenu({
  object,
}: {
  object: ObjectStorageObject;
}) {
  const sealosContext = createSealosContext();
  const k8sContext = createK8sContext();

  const deleteObjectStorage = useDeleteObjectStorageMutation(sealosContext);
  const removeFromProject = useRemoveFromProjectMutation(k8sContext);

  const { name, displayName } = object;

  // console.log("object", object);

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
      <DropdownMenuContent
        className="rounded-xl bg-background-secondary"
        align="start"
      >
        <DropdownMenuItem>
          <PencilLine className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            const objectStorageTarget = convertResourceTypeToTarget(
              "objectstoragebucket",
              name
            );
            removeFromProject.mutate({
              resources: [objectStorageTarget],
            });
          }}
          disabled={!name}
        >
          <PencilLine className="mr-2 h-4 w-4" />
          Remove from Project
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            deleteObjectStorage.mutate({ bucketName: displayName });
          }}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
