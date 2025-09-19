import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import type { ObjectStorageApiContext } from "../schemas/objectstorage-api-context-schemas";
import { runParallelAction } from "next-server-actions-parallel";
import { createSealosApi } from "@/lib/sealos/sealos-utils";
import {
  createObjectStorage,
  deleteObjectStorage,
  closeObjectStorageHost,
  openObjectStorageHost,
  getObjectStorageStatus,
  initObjectStorageUser,
} from "./objectstorage-old-api";
import type {
  ObjectStorageCreateRequest,
  ObjectStorageCreateResponse,
} from "../schemas/req-res-schemas/req-res-create-schemas";
import type {
  ObjectStorageDeleteRequest,
  ObjectStorageDeleteResponse,
} from "../schemas/req-res-schemas/req-res-delete-schemas";
import type {
  ObjectStorageCloseHostRequest,
  ObjectStorageCloseHostResponse,
} from "../schemas/req-res-schemas/req-res-closehost-schemas";
import type {
  ObjectStorageOpenHostRequest,
  ObjectStorageOpenHostResponse,
} from "../schemas/req-res-schemas/req-res-openhost-schemas";
import type {
  ObjectStorageStatusRequest,
  ObjectStorageStatusResponse,
} from "../schemas/req-res-schemas/req-res-status-schemas";
import type { ObjectStorageInitResponse } from "../schemas/req-res-schemas/req-res-init-schemas";

// Helper functions using the universal API utility
function createObjectStorageAxios(context: SealosApiContext) {
  return createSealosApi(context, "objectstorage");
}

// ===== UTILITY TYPES =====

// Common request types for easier usage
export type ObjectStorageBucketName = string;
export type ObjectStorageBucketPolicy =
  | "private"
  | "publicRead"
  | "publicReadwrite";

// ===== QUERY OPERATIONS =====

// Object Storage Status & Information
export async function getObjectStorageStatusInfo(
  context: ObjectStorageApiContext,
  request: ObjectStorageStatusRequest
): Promise<ObjectStorageStatusResponse> {
  return await runParallelAction(getObjectStorageStatus(request, context));
}

export async function initObjectStorageUserInfo(
  context: ObjectStorageApiContext
): Promise<ObjectStorageInitResponse> {
  return await runParallelAction(initObjectStorageUser(context));
}

// ===== MUTATION OPERATIONS =====

// Object Storage Lifecycle Management
export async function createObjectStorageBucket(
  context: ObjectStorageApiContext,
  request: ObjectStorageCreateRequest
): Promise<ObjectStorageCreateResponse> {
  return await runParallelAction(createObjectStorage(request, context));
}

export async function deleteObjectStorageBucket(
  context: ObjectStorageApiContext,
  request: ObjectStorageDeleteRequest
): Promise<ObjectStorageDeleteResponse> {
  return await runParallelAction(deleteObjectStorage(request, context));
}

// Host Management
export async function closeObjectStorageHostConnection(
  context: ObjectStorageApiContext,
  request: ObjectStorageCloseHostRequest
): Promise<ObjectStorageCloseHostResponse> {
  return await runParallelAction(closeObjectStorageHost(request, context));
}

export async function openObjectStorageHostConnection(
  context: ObjectStorageApiContext,
  request: ObjectStorageOpenHostRequest
): Promise<ObjectStorageOpenHostResponse> {
  return await runParallelAction(openObjectStorageHost(request, context));
}

// ===== UTILITY FUNCTIONS =====

// Convert SealosApiContext to ObjectStorageApiContext for compatibility
export function convertToObjectStorageContext(
  context: SealosApiContext
): ObjectStorageApiContext {
  return {
    baseUrl: context.baseUrl,
    authorization: context.authorization,
  };
}

// Wrapper functions that use SealosApiContext directly
export async function createObjectStorageBucketWithSealosContext(
  context: SealosApiContext,
  request: ObjectStorageCreateRequest
): Promise<ObjectStorageCreateResponse> {
  const objectStorageContext = convertToObjectStorageContext(context);
  return await createObjectStorageBucket(objectStorageContext, request);
}

export async function deleteObjectStorageBucketWithSealosContext(
  context: SealosApiContext,
  request: ObjectStorageDeleteRequest
): Promise<ObjectStorageDeleteResponse> {
  const objectStorageContext = convertToObjectStorageContext(context);
  return await deleteObjectStorageBucket(objectStorageContext, request);
}

export async function getObjectStorageStatusWithSealosContext(
  context: SealosApiContext,
  request: ObjectStorageStatusRequest
): Promise<ObjectStorageStatusResponse> {
  const objectStorageContext = convertToObjectStorageContext(context);
  return await getObjectStorageStatusInfo(objectStorageContext, request);
}

export async function initObjectStorageUserWithSealosContext(
  context: SealosApiContext
): Promise<ObjectStorageInitResponse> {
  const objectStorageContext = convertToObjectStorageContext(context);
  return await initObjectStorageUserInfo(objectStorageContext);
}

export async function closeObjectStorageHostWithSealosContext(
  context: SealosApiContext,
  request: ObjectStorageCloseHostRequest
): Promise<ObjectStorageCloseHostResponse> {
  const objectStorageContext = convertToObjectStorageContext(context);
  return await closeObjectStorageHostConnection(objectStorageContext, request);
}

export async function openObjectStorageHostWithSealosContext(
  context: SealosApiContext,
  request: ObjectStorageOpenHostRequest
): Promise<ObjectStorageOpenHostResponse> {
  const objectStorageContext = convertToObjectStorageContext(context);
  return await openObjectStorageHostConnection(objectStorageContext, request);
}

// ===== CONVENIENCE FUNCTIONS =====

// Simplified functions that take individual parameters instead of request objects
export async function createBucket(
  context: SealosApiContext,
  bucketName: ObjectStorageBucketName,
  policy: ObjectStorageBucketPolicy = "private"
): Promise<ObjectStorageCreateResponse> {
  return await createObjectStorageBucketWithSealosContext(context, {
    bucketName,
    bucketPolicy: policy,
  });
}

export async function deleteBucket(
  context: SealosApiContext,
  bucketName: ObjectStorageBucketName
): Promise<ObjectStorageDeleteResponse> {
  return await deleteObjectStorageBucketWithSealosContext(context, {
    bucketName,
  });
}

export async function openHost(
  context: SealosApiContext,
  bucketName: ObjectStorageBucketName
): Promise<ObjectStorageOpenHostResponse> {
  return await openObjectStorageHostWithSealosContext(context, {
    bucket: bucketName,
  });
}

export async function closeHost(
  context: SealosApiContext,
  bucketName: ObjectStorageBucketName
): Promise<ObjectStorageCloseHostResponse> {
  return await closeObjectStorageHostWithSealosContext(context, {
    bucket: bucketName,
  });
}

export async function getStatus(
  context: SealosApiContext,
  bucketName: ObjectStorageBucketName
): Promise<ObjectStorageStatusResponse> {
  return await getObjectStorageStatusWithSealosContext(context, {
    bucket: bucketName,
  });
}

export async function initializeUser(
  context: SealosApiContext
): Promise<ObjectStorageInitResponse> {
  return await initObjectStorageUserWithSealosContext(context);
}
