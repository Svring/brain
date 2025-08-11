"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useQueryClient } from "@tanstack/react-query";
import {
  getObjectStorageOptions,
  listObjectStorageOptions,
} from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-query";
import {
  useCreateObjectStorageMutation,
  useDeleteObjectStorageMutation,
} from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-mutation";
import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  AITool,
  AIToolContent,
  AIToolHeader,
  AIToolParameters,
  AIToolResult,
} from "@/components/shadcn-io/ai/tool";
import { AIResponse } from "@/components/shadcn-io/ai/response";

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
        enum: ["private", "publicRead", "publicReadWrite"],
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

      return await createObjectStorage.mutateAsync(createRequest);
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"createObjectStorageBucket"}>
          <AIToolHeader
            description={"Create a new object storage bucket"}
            name={"createObjectStorageBucket"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
}

function listObjectStorageBucketAction(k8sContext: K8sApiContext) {
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "listObjectStorageBuckets",
    description: "List all object storage buckets",
    parameters: [],
    handler: async () => {
      const bucketList = await queryClient.fetchQuery(
        listObjectStorageOptions(k8sContext)
      );
      return bucketList;
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"listObjectStorageBuckets"}>
          <AIToolHeader
            description={"List all object storage buckets"}
            name={"listObjectStorageBuckets"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
}

function getObjectStorageBucketAction(k8sContext: K8sApiContext) {
  const queryClient = useQueryClient();

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
        ...convertResourceTypeToTarget("objectstoragebucket"),
        name: bucketName,
      });
      return await queryClient.fetchQuery(
        getObjectStorageOptions(k8sContext, target)
      );
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"getObjectStorageBucket"}>
          <AIToolHeader
            description={"Get details of a specific object storage bucket"}
            name={"getObjectStorageBucket"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
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

      return await deleteObjectStorage.mutateAsync(deleteRequest);
    },
    render: ({ args, result, status }) => {
      return (
        <AITool key={"deleteObjectStorageBucket"}>
          <AIToolHeader
            description={"Delete an object storage bucket"}
            name={"deleteObjectStorageBucket"}
            status={status}
          />
          <AIToolContent>
            <AIToolParameters parameters={args} />
            {result && (
              <AIToolResult result={<AIResponse>{result}</AIResponse>} />
            )}
          </AIToolContent>
        </AITool>
      );
    },
  });
}
