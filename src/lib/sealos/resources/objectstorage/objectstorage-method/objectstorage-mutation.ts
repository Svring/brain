"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  createObjectStorage,
  deleteObjectStorage,
  closeObjectStorageHost,
  openObjectStorageHost,
} from "../objectstorage-api/objectstorage-old-api";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import type { ObjectStorageCreateRequest } from "../schemas/req-res-schemas/req-res-create-schemas";
import type { ObjectStorageDeleteRequest } from "../schemas/req-res-schemas/req-res-delete-schemas";
import { toast } from "sonner";
import { ObjectStorageApiContext } from "../schemas/objectstorage-api-context-schemas";

export function useCreateObjectStorageMutation(
  context: ObjectStorageApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ObjectStorageCreateRequest) =>
      runParallelAction(createObjectStorage(request, context)),
    onSuccess: () => {
      toast.success("Object storage created");
      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["objectstoragebucket"],
      });
    },
  });
}

export function useDeleteObjectStorageMutation(
  context: ObjectStorageApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ObjectStorageDeleteRequest) =>
      runParallelAction(deleteObjectStorage(request, context)),
    onSuccess: () => {
      toast.success("Object storage deleted");
      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["objectstoragebucket"],
      });
    },
  });
}

export function useCloseObjectStorageHostMutation(
  context: ObjectStorageApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: any) =>
      runParallelAction(closeObjectStorageHost(request, context)),
    onSuccess: () => {
      toast.success("Object storage host closed");
      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["objectstoragebucket"],
      });
    },
  });
}

export function useOpenObjectStorageHostMutation(
  context: ObjectStorageApiContext
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: any) =>
      runParallelAction(openObjectStorageHost(request, context)),
    onSuccess: () => {
      toast.success("Object storage host opened");
      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["objectstoragebucket"],
      });
    },
  });
}
