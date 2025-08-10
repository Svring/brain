"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import {
  createObjectStorage,
  deleteObjectStorage,
} from "../objectstorage-api/objectstorage-old-api";
import { SealosApiContext } from "../../sealos-api-context-schema";
import type { ObjectStorageCreateRequest } from "../schemas/req-res-schemas/req-res-create-schemas";
import type { ObjectStorageDeleteRequest } from "../schemas/req-res-schemas/req-res-delete-schemas";

export function useCreateObjectStorageMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ObjectStorageCreateRequest) =>
      runParallelAction(createObjectStorage(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "objectstorage", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "objectstorages"],
      });
    },
  });
}

export function useDeleteObjectStorageMutation(context: SealosApiContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ObjectStorageDeleteRequest) =>
      runParallelAction(deleteObjectStorage(request, context)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sealos", "objectstorage", "list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "objectstorages"],
      });
    },
  });
}
