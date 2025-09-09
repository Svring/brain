"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import {
  AITool,
  AIToolContent,
  AIToolHeader,
  AIToolParameters,
  AIToolResult,
} from "@/components/shadcn-io/ai/tool";
import { AIResponse } from "@/components/shadcn-io/ai/response";
import { jsonSchemaToActionParameters } from "@copilotkit/shared";
import { zodToJsonSchema } from "zod-to-json-schema";
import { objectStorageCreateSchema } from "@/schemas/forms/objectstorage/objectstorage-create-form-schema";
import { ObjectStorageCreateActionMessage } from "@/components/copilot/sealos/objectstorage/objectstorage-create-action-message";
import { ObjectStorageCreateFormData } from "@/schemas/forms/objectstorage/objectstorage-create-form-schema";

export function activateObjectStorageBucketActions() {
  // CRUD operations
  createObjectStorageBucketAction();
  deleteObjectStorageBucketAction();
}

function createObjectStorageBucketAction() {
  useCopilotAction({
    name: "createObjectStorageBucket",
    description: "Create a new object storage bucket with specified configuration",
    followUp: false,
    parameters: jsonSchemaToActionParameters(
      zodToJsonSchema(objectStorageCreateSchema) as any
    ),
    renderAndWaitForResponse: (props) => {
      return (
        <ObjectStorageCreateActionMessage
          args={props.args as Partial<ObjectStorageCreateFormData>}
          respond={props.respond}
          status={props.status}
        />
      );
    },
  });
}


function deleteObjectStorageBucketAction() {
  const { objectstorage } = useTRPCClients();
  const deleteObjectStorageMutation = useMutation({
    ...objectstorage.delete.mutationOptions(),
  });

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
      const result = await deleteObjectStorageMutation.mutateAsync({ bucketName });
      return `Object storage bucket "${bucketName}" deleted successfully`;
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
