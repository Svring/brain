import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { ObjectStorageContext } from "./objectstorage-trpc-context";

import {
  ObjectStorageCreateRequestSchema,
  ObjectStorageCreateResponseSchema,
} from "@/lib/sealos/resources/objectstorage/schemas/req-res-schemas/req-res-create-schemas";
import {
  ObjectStorageDeleteRequestSchema,
  ObjectStorageDeleteResponseSchema,
} from "@/lib/sealos/resources/objectstorage/schemas/req-res-schemas/req-res-delete-schemas";
import {
  ObjectStorageCloseHostRequestSchema,
  ObjectStorageCloseHostResponseSchema,
} from "@/lib/sealos/resources/objectstorage/schemas/req-res-schemas/req-res-closehost-schemas";
import {
  ObjectStorageOpenHostRequestSchema,
  ObjectStorageOpenHostResponseSchema,
} from "@/lib/sealos/resources/objectstorage/schemas/req-res-schemas/req-res-openhost-schemas";
import {
  ObjectStorageStatusRequestSchema,
  ObjectStorageStatusResponseSchema,
} from "@/lib/sealos/resources/objectstorage/schemas/req-res-schemas/req-res-status-schemas";
import { ObjectStorageInitResponseSchema } from "@/lib/sealos/resources/objectstorage/schemas/req-res-schemas/req-res-init-schemas";
import { K8sApiContextSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  getObjectStorage,
  listObjectStorage,
} from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-query";
import {
  createObjectStorageBucketWithSealosContext,
  deleteObjectStorageBucketWithSealosContext,
  closeObjectStorageHostWithSealosContext,
  openObjectStorageHostWithSealosContext,
  getObjectStorageStatusWithSealosContext,
  initObjectStorageUserWithSealosContext,
} from "@/lib/sealos/resources/objectstorage/objectstorage-api/objectstorage-api-service";

const t = initTRPC.context<ObjectStorageContext>().create();

export const objectStorageRouter = t.router({
  // ===== QUERY PROCEDURES =====

  // ObjectStorage Information
  get: t.procedure
    .input(CustomResourceTargetSchema)
    .query(async ({ input, ctx }) => {
      const k8sContext = K8sApiContextSchema.parse({
        kubeconfig: ctx.kubeconfig,
        namespace: ctx.namespace,
        regionUrl: ctx.regionUrl,
      });
      return await getObjectStorage(k8sContext, input);
    }),

  list: t.procedure.input(K8sApiContextSchema).query(async ({ input }) => {
    return await listObjectStorage(input);
  }),

  // Status and User Management
  getStatus: t.procedure
    .input(ObjectStorageStatusRequestSchema)
    .output(ObjectStorageStatusResponseSchema)
    .query(async ({ ctx, input }) => {
      const sealosContext = {
        baseUrl: ctx.regionUrl,
        authorization: ctx.kubeconfig,
      };
      return await getObjectStorageStatusWithSealosContext(
        sealosContext,
        input
      );
    }),

  initUser: t.procedure
    .output(ObjectStorageInitResponseSchema)
    .query(async ({ ctx }) => {
      const sealosContext = {
        baseUrl: ctx.regionUrl,
        authorization: ctx.kubeconfig,
      };
      return await initObjectStorageUserWithSealosContext(sealosContext);
    }),

  // ===== MUTATION PROCEDURES =====

  // ObjectStorage Lifecycle Management
  create: t.procedure
    .input(ObjectStorageCreateRequestSchema)
    .output(ObjectStorageCreateResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const sealosContext = {
        baseUrl: ctx.regionUrl,
        authorization: ctx.kubeconfig,
      };
      return await createObjectStorageBucketWithSealosContext(
        sealosContext,
        input
      );
    }),

  delete: t.procedure
    .input(ObjectStorageDeleteRequestSchema)
    .output(ObjectStorageDeleteResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const sealosContext = {
        baseUrl: ctx.regionUrl,
        authorization: ctx.authorization,
      };
      return await deleteObjectStorageBucketWithSealosContext(
        sealosContext,
        input
      );
    }),

  // Host Management
  closeHost: t.procedure
    .input(ObjectStorageCloseHostRequestSchema)
    .output(ObjectStorageCloseHostResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const sealosContext = {
        baseUrl: ctx.regionUrl,
        authorization: ctx.kubeconfig,
      };
      return await closeObjectStorageHostWithSealosContext(
        sealosContext,
        input
      );
    }),

  openHost: t.procedure
    .input(ObjectStorageOpenHostRequestSchema)
    .output(ObjectStorageOpenHostResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const sealosContext = {
        baseUrl: ctx.regionUrl,
        authorization: ctx.kubeconfig,
      };
      return await openObjectStorageHostWithSealosContext(sealosContext, input);
    }),
});

export type ObjectStorageRouter = typeof objectStorageRouter;
