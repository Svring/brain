import axios from "axios";
import { DeployApiContext } from "./schemas/deploy-api-conetxt-schemas";
import { createParallelAction } from "next-server-actions-parallel";
import {
  DeployCreateRequest,
  DeployCreateResponse,
  DeployCreateRequestSchema,
  DeployCreateResponseSchema,
} from "./schemas/req-res-schemas/req-res-create-schemas";
import {
  DeployPauseRequest,
  DeployPauseResponse,
  DeployPauseRequestSchema,
  DeployPauseResponseSchema,
} from "./schemas/req-res-schemas/req-res-pause-schemas";
import {
  DeployStartRequest,
  DeployStartResponse,
  DeployStartRequestSchema,
  DeployStartResponseSchema,
} from "./schemas/req-res-schemas/req-res-start-schemas";
import {
  DeployDeleteRequest,
  DeployDeleteResponse,
  DeployDeleteRequestSchema,
  DeployDeleteResponseSchema,
} from "./schemas/req-res-schemas/req-res-delete-schemas";

function createDeployApi(context: DeployApiContext) {
  return axios.create({
    baseURL: `https://applaunchpad.${context.baseURL}/api`,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
    },
  });
}

export const createDeploy = createParallelAction(
  async (
    request: DeployCreateRequest,
    context: DeployApiContext
  ): Promise<DeployCreateResponse> => {
    const validatedRequest = DeployCreateRequestSchema.parse(request);
    const api = createDeployApi(context);
    const response = await api.post("/applyApp", validatedRequest);
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
