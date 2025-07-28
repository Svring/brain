"use server";

import axios from "axios";
import { DeployApiContext } from "../schemas/deploy-api-context-schemas";
import { createParallelAction } from "next-server-actions-parallel";
import {
  DeployCreateRequest,
  DeployCreateResponse,
  DeployCreateRequestSchema,
  DeployCreateResponseSchema,
} from "../schemas/req-res-schemas/req-res-create-schemas";
import {
  DeployPauseRequest,
  DeployPauseResponse,
  DeployPauseRequestSchema,
  DeployPauseResponseSchema,
} from "../schemas/req-res-schemas/req-res-pause-schemas";
import {
  DeployStartRequest,
  DeployStartResponse,
  DeployStartRequestSchema,
  DeployStartResponseSchema,
} from "../schemas/req-res-schemas/req-res-start-schemas";
import {
  DeployDeleteRequest,
  DeployDeleteResponse,
  DeployDeleteRequestSchema,
  DeployDeleteResponseSchema,
} from "../schemas/req-res-schemas/req-res-delete-schemas";
import {
  DeployCheckReadyRequest,
  DeployCheckReadyResponse,
  DeployCheckReadyRequestSchema,
  DeployCheckReadyResponseSchema,
} from "../schemas/req-res-schemas/req-res-check-ready-schemas";
import { generateK8sManifests } from "./deployment-api-utils";
import https from "https";

function createDeployApi(context: DeployApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: `https://applaunchpad.${context.baseURL}/api`,
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

export const createDeploy = createParallelAction(
  async (
    request: DeployCreateRequest,
    context: DeployApiContext
  ): Promise<DeployCreateResponse> => {
    const validatedRequest = DeployCreateRequestSchema.parse(request);
    const manifests = await generateK8sManifests(validatedRequest);
    const api = createDeployApi(context);
    const response = await api.post("/applyApp", manifests);
    return DeployCreateResponseSchema.parse(response.data);
  }
);

export const pauseDeploy = createParallelAction(
  async (
    request: DeployPauseRequest,
    context: DeployApiContext
  ): Promise<DeployPauseResponse> => {
    const validatedRequest = DeployPauseRequestSchema.parse(request);
    const api = createDeployApi(context);
    const response = await api.get("/pauseApp", {
      params: { appName: validatedRequest.appName },
    });
    return DeployPauseResponseSchema.parse(response.data);
  }
);

export const startDeploy = createParallelAction(
  async (
    request: DeployStartRequest,
    context: DeployApiContext
  ): Promise<DeployStartResponse> => {
    const validatedRequest = DeployStartRequestSchema.parse(request);
    const api = createDeployApi(context);
    const response = await api.get("/startApp", {
      params: { appName: validatedRequest.appName },
    });
    return DeployStartResponseSchema.parse(response.data);
  }
);

export const deleteDeploy = createParallelAction(
  async (
    request: DeployDeleteRequest,
    context: DeployApiContext
  ): Promise<DeployDeleteResponse> => {
    const validatedRequest = DeployDeleteRequestSchema.parse(request);
    const api = createDeployApi(context);
    const response = await api.get("/delApp", {
      params: { name: validatedRequest.name },
    });
    return DeployDeleteResponseSchema.parse(response.data);
  }
);

export const checkReadyDeploy = createParallelAction(
  async (
    request: DeployCheckReadyRequest,
    context: DeployApiContext
  ): Promise<DeployCheckReadyResponse> => {
    const validatedRequest = DeployCheckReadyRequestSchema.parse(request);
    const api = createDeployApi(context);
    const response = await api.get("/checkReady", {
      params: { appName: validatedRequest.appName },
    });
    return DeployCheckReadyResponseSchema.parse(response.data);
  }
);
