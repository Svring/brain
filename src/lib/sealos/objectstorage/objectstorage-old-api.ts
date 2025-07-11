import axios from "axios";
import { ObjectStorageApiContext } from "./schemas/objectstorage-api-context-schemas";
import { createParallelAction } from "next-server-actions-parallel";
import {
  ObjectStorageCreateRequest,
  ObjectStorageCreateResponse,
  ObjectStorageCreateRequestSchema,
  ObjectStorageCreateResponseSchema,
} from "./schemas/req-res-schemas/req-res-create-schemas";
import {
  ObjectStorageDeleteRequest,
  ObjectStorageDeleteResponse,
  ObjectStorageDeleteRequestSchema,
  ObjectStorageDeleteResponseSchema,
} from "./schemas/req-res-schemas/req-res-delete-schemas";

function createObjectStorageApi(context: ObjectStorageApiContext) {
  return axios.create({
    baseURL: `https://objectstorage.${context.baseURL}/api/bucket`,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
    },
  });
}

export const createObjectStorage = createParallelAction(
  async (
    request: ObjectStorageCreateRequest,
    context: ObjectStorageApiContext
  ): Promise<ObjectStorageCreateResponse> => {
    const validatedRequest = ObjectStorageCreateRequestSchema.parse(request);
    const api = createObjectStorageApi(context);
    const response = await api.post("/create", validatedRequest);
    return ObjectStorageCreateResponseSchema.parse(response.data);
  }
);

export const deleteObjectStorage = createParallelAction(
  async (
    request: ObjectStorageDeleteRequest,
    context: ObjectStorageApiContext
  ): Promise<ObjectStorageDeleteResponse> => {
    const validatedRequest = ObjectStorageDeleteRequestSchema.parse(request);
    const api = createObjectStorageApi(context);
    const response = await api.post("/delete", validatedRequest);
    return ObjectStorageDeleteResponseSchema.parse(response.data);
  }
);
