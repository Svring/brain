import type React from "react";
import { EnvAdapter } from "./env.adapter";

interface EnvProviderProps {
	children: React.ReactNode;
}

export function EnvProvider({ children }: EnvProviderProps) {
	// Read environment variables (server-side)
	const mode =
		(process.env.MODE as "development" | "production") || "production";

	const langgraphDeploymentUrl = process.env.LANGGRAPH_DEPLOYMENT_URL;
	const graphId = process.env.LANGGRAPH_GRAPH_ID;

	// Create the env context with MODE and variables
	const envContext = {
		mode,
		variables: langgraphDeploymentUrl
			? {
					LANGGRAPH_DEPLOYMENT_URL: langgraphDeploymentUrl,
					LANGGRAPH_GRAPH_ID: graphId,
				}
			: null,
	};

	return <EnvAdapter envContext={envContext}>{children}</EnvAdapter>;
}
