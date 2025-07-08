import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  ExperimentalEmptyAdapter,
  langGraphPlatformEndpoint,
} from "@copilotkit/runtime";
import type { NextRequest } from "next/server";

// You can use any service adapter here for multi-agent support.
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  remoteEndpoints: [
    langGraphPlatformEndpoint({
      deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL || "",
      langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
      agents: [
        {
          name: "ai",
          description: "agent.",
        },
      ],
    }),
  ],
});

export const POST = async (req: NextRequest) => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/ai",
  });

  return handleRequest(req);
};
