"use server";

import axios from "axios";
import { ObjectStorageApiContext } from "../schemas/objectstorage-api-context-schemas";
import { createParallelAction } from "next-server-actions-parallel";
import {
  ObjectStorageCreateRequest,
  ObjectStorageCreateResponse,
  ObjectStorageCreateRequestSchema,
  ObjectStorageCreateResponseSchema,
} from "../schemas/req-res-schemas/req-res-create-schemas";
import {
  ObjectStorageDeleteRequest,
  ObjectStorageDeleteResponse,
  ObjectStorageDeleteRequestSchema,
  ObjectStorageDeleteResponseSchema,
} from "../schemas/req-res-schemas/req-res-delete-schemas";
import {
  ObjectStorageCloseHostRequest,
  ObjectStorageCloseHostResponse,
  ObjectStorageCloseHostRequestSchema,
  ObjectStorageCloseHostResponseSchema,
} from "../schemas/req-res-schemas/req-res-closehost-schemas";
import {
  ObjectStorageOpenHostRequest,
  ObjectStorageOpenHostResponse,
  ObjectStorageOpenHostRequestSchema,
  ObjectStorageOpenHostResponseSchema,
} from "../schemas/req-res-schemas/req-res-openhost-schemas";
import {
  ObjectStorageStatusRequest,
  ObjectStorageStatusResponse,
  ObjectStorageStatusRequestSchema,
  ObjectStorageStatusResponseSchema,
} from "../schemas/req-res-schemas/req-res-status-schemas";
import {
  ObjectStorageInitResponse,
  ObjectStorageInitResponseSchema,
} from "../schemas/req-res-schemas/req-res-init-schemas";
import https from "https";

function createObjectStorageApi(context: ObjectStorageApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: `http://objectstorage.${context.baseUrl}/api`,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
    },
    httpsAgent: isDevelopment
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
  });
}

export const createObjectStorage = createParallelAction(
  async (
    request: ObjectStorageCreateRequest,
    context: ObjectStorageApiContext
  ): Promise<ObjectStorageCreateResponse> => {
    const validatedRequest = ObjectStorageCreateRequestSchema.parse(request);
    const api = createObjectStorageApi(context);
    const response = await api.post("/bucket/create", validatedRequest);
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
    const response = await api.post("/bucket/delete", validatedRequest);
    return ObjectStorageDeleteResponseSchema.parse(response.data);
  }
);

export const closeObjectStorageHost = createParallelAction(
  async (
    request: ObjectStorageCloseHostRequest,
    context: ObjectStorageApiContext
  ): Promise<ObjectStorageCloseHostResponse> => {
    const validatedRequest = ObjectStorageCloseHostRequestSchema.parse(request);
    const api = createObjectStorageApi(context);
    const response = await api.post("/site/closeHost", validatedRequest);
    return ObjectStorageCloseHostResponseSchema.parse(response.data);
  }
);

export const openObjectStorageHost = createParallelAction(
  async (
    request: ObjectStorageOpenHostRequest,
    context: ObjectStorageApiContext
  ): Promise<ObjectStorageOpenHostResponse> => {
    const validatedRequest = ObjectStorageOpenHostRequestSchema.parse(request);
    const api = createObjectStorageApi(context);
    const response = await api.post("/site/openHost", validatedRequest);
    return ObjectStorageOpenHostResponseSchema.parse(response.data);
  }
);

export const getObjectStorageStatus = createParallelAction(
  async (
    request: ObjectStorageStatusRequest,
    context: ObjectStorageApiContext
  ): Promise<ObjectStorageStatusResponse> => {
    const validatedRequest = ObjectStorageStatusRequestSchema.parse(request);
    const api = createObjectStorageApi(context);
    const response = await api.post("/site/status", validatedRequest);
    return ObjectStorageStatusResponseSchema.parse(response.data);
  }
);

export const initObjectStorageUser = createParallelAction(
  async (
    context: ObjectStorageApiContext
  ): Promise<ObjectStorageInitResponse> => {
    const api = createObjectStorageApi(context);
    const response = await api.get("/user/init");
    return ObjectStorageInitResponseSchema.parse(response.data);
  }
);
