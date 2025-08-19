import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  EmptyAdapter,
  LangGraphAgent,
} from "@copilotkit/runtime";
import type { NextRequest } from "next/server";

// Force Node runtime and dynamic route to avoid Edge bundling churn and static optimization
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cache singletons across HMR in development to avoid re-instantiation costs
const g = globalThis as any;

if (!g.__copilot_serviceAdapter) {
  g.__copilot_serviceAdapter = new EmptyAdapter();
}
const serviceAdapter = g.__copilot_serviceAdapter;

if (!g.__copilot_runtime) {
  g.__copilot_runtime = new CopilotRuntime({
    agents: {
      orca: new LangGraphAgent({
        deploymentUrl: process.env.NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL || "",
        graphId: "orca",
        langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
      }),
    },
  });
}
const runtimeSingleton: CopilotRuntime = g.__copilot_runtime;

if (!g.__copilot_handleRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: runtimeSingleton,
    serviceAdapter,
    endpoint: "/api/copilot",
  });
  g.__copilot_handleRequest = handleRequest;
}
const handleRequest: (req: NextRequest) => Promise<Response> =
  g.__copilot_handleRequest;

export const POST = async (req: NextRequest) => {
  return handleRequest(req);
};
