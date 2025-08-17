import { initTRPC } from "@trpc/server";
import {
  createDevboxApi,
  getDevboxList,
} from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api";
import type { DevboxContext } from "../contexts/devbox-context";

import type {
  AppFormConfig,
  CreateAppResponse,
  DeleteAppResponse,
  DevboxApiContext,
  DevboxCreateRequest,
  DevboxCreateResponse,
  DevboxDeleteResponse,
  DevboxDeployRequest,
  DevboxDeployResponse,
  DevboxGetResponse,
  DevboxLifecycleRequest,
  DevboxLifecycleResponse,
  DevboxListResponse,
  DevboxPortCreateRequest,
  DevboxPortCreateResponse,
  DevboxPortRemoveResponse,
  DevboxReleaseRequest,
  DevboxReleaseResponse,
  DevboxReleasesResponse,
  GetAppByNameResponse,
  GetAppPodsResponse,
  GetAppsResponse,
} from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import {
  AppFormConfigSchema,
  CreateAppRequestSchema,
  CreateAppResponseSchema,
  DeleteAppResponseSchema,
  DevboxCreateRequestSchema,
  DevboxCreateResponseSchema,
  DevboxDeleteResponseSchema,
  DevboxDeployRequestSchema,
  DevboxDeployResponseSchema,
  DevboxErrorDataSchema,
  DevboxGetResponseSchema,
  DevboxLifecycleRequestSchema,
  DevboxLifecycleResponseSchema,
  DevboxListResponseSchema,
  DevboxPortCreateRequestSchema,
  DevboxPortCreateResponseSchema,
  DevboxPortRemoveResponseSchema,
  DevboxReleaseRequestSchema,
  DevboxReleaseResponseSchema,
  DevboxReleasesResponseSchema,
  GetAppByNameResponseSchema,
  GetAppPodsResponseSchema,
  GetAppsResponseSchema,
} from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import { runParallelAction } from "next-server-actions-parallel";

const t = initTRPC.context<DevboxContext>().create();

export const devboxRouter = t.router({
  listDevboxes: t.procedure.query(async ({ ctx }) => {
    const api = await createDevboxApi(ctx);
    const response = await api.get("/list");
    return DevboxListResponseSchema.parse(response.data);
  }),
});

export type DevboxRouter = typeof devboxRouter;
