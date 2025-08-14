"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Settings,
  Download,
  Upload,
  Trash2,
  PencilLine,
  Key,
} from "lucide-react";
import { createK8sContext, createSealosContext } from "@/lib/auth/auth-utils";
import { useDeleteObjectStorageMutation } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-mutation";
import { ObjectStorageObject } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";
import { useRemoveFromProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";

export default function ObjectStorageNodeMenu({ object }: { object: ObjectStorageObject }) {
  const sealosContext = createSealosContext();
  const k8sContext = createK8sContext();
  
  const deleteObjectStorage = useDeleteObjectStorageMutation(sealosContext);
  const removeFromProject = useRemoveFromProjectMutation(k8sContext);

  const { name } = object;

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
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Key className="mr-2 h-4 w-4" />
          Access Keys
        </DropdownMenuItem>
        <DropdownMenuItem>
          <PencilLine className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            const objectStorageTarget = convertResourceTypeToTarget("objectstorage", name);
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
            deleteObjectStorage.mutate({ bucketName: name });
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