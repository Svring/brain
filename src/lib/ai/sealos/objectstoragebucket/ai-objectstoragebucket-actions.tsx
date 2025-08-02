"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useQuery } from "@tanstack/react-query";
import {
  getObjectStorageOptions,
  listObjectStorageOptions,
} from "@/lib/sealos/objectstorage/objectstorage-method/objectstorage-query";
import {
  useCreateObjectStorageMutation,
  useDeleteObjectStorageMutation,
} from "@/lib/sealos/objectstorage/objectstorage-method/objectstorage-mutation";
import { createObjectStorageContext } from "@/lib/sealos/objectstorage/objectstorage-utils";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export function activateObjectStorageBucketActions(
  k8sContext: K8sApiContext,
  sealosContext: SealosApiContext
) {
  createObjectStorageBucketAction(sealosContext);
  listObjectStorageBucketAction(k8sContext);
  getObjectStorageBucketAction(k8sContext);
  deleteObjectStorageBucketAction(sealosContext);
}

function createObjectStorageBucketAction(sealosContext: SealosApiContext) {
  const createObjectStorage = useCreateObjectStorageMutation(sealosContext);

  useCopilotAction({
    name: "createObjectStorageBucket",
    description: "Create a new object storage bucket",
    parameters: [
      {
        name: "bucketName",
        type: "string",
        description: "Name of the bucket to create",
        required: true,
      },
      {
        name: "bucketPolicy",
        type: "string",
        description: "Bucket policy (private, publicRead, publicReadWrite)",
        required: false,
      },
    ],
    handler: async ({ bucketName, bucketPolicy }) => {
      const createRequest = {
        bucketName,
        bucketPolicy:
          (bucketPolicy as "private" | "publicRead" | "publicReadWrite") ||
          "private",
      };

      await createObjectStorage.mutateAsync(createRequest);
      return `Object storage bucket '${bucketName}' created successfully with policy '${
        bucketPolicy || "private"
      }'.`;
    },
  });
}

function listObjectStorageBucketAction(k8sContext: K8sApiContext) {
  const { data: bucketList } = useQuery(listObjectStorageOptions(k8sContext));

  useCopilotAction({
    name: "listObjectStorageBuckets",
    description: "List all object storage buckets",
    parameters: [],
    handler: async () => {
      if (!bucketList || !Array.isArray(bucketList)) {
        return "No buckets found or data not loaded yet.";
      }

      const bucketNames = bucketList
        .map((bucket: any) => bucket.metadata?.name)
        .filter(Boolean);

      return `Found ${bucketNames.length} buckets: ${bucketNames.join(", ")}`;
    },
  });
}

function getObjectStorageBucketAction(k8sContext: K8sApiContext) {
  useCopilotAction({
    name: "getObjectStorageBucket",
    description: "Get details of a specific object storage bucket",
    parameters: [
      {
        name: "bucketName",
        type: "string",
        description: "Name of the bucket to get details for",
        required: true,
      },
    ],
    handler: async ({ bucketName }) => {
      const target = CustomResourceTargetSchema.parse({
        type: "objectstoragebucket",
        name: bucketName,
      });
      const { data: bucket } = useQuery(
        getObjectStorageOptions(k8sContext, target)
      );

      return `Bucket '${bucketName}' details: Status: ${
        (bucket as any).status?.phase || "Unknown"
      }, Policy: ${(bucket as any).spec?.policy || "Unknown"}`;
    },
  });
}

function deleteObjectStorageBucketAction(sealosContext: SealosApiContext) {
  const deleteObjectStorage = useDeleteObjectStorageMutation(sealosContext);

  useCopilotAction({
    name: "deleteObjectStorageBucket",
    description: "Delete an object storage bucket",
    parameters: [
      {
        name: "bucketName",
        type: "string",
        description: "Name of the bucket to delete",
        required: true,
      },
    ],
    handler: async ({ bucketName }) => {
      const deleteRequest = {
        bucketName,
      };

      await deleteObjectStorage.mutateAsync(deleteRequest);
      return `Object storage bucket '${bucketName}' deleted successfully.`;
    },
  });
}
