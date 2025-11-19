"use client";

import { createContext, type ReactNode, useContext } from "react";

interface EnvContextType {
	MODE: string;
	LANGGRAPH_DEPLOYMENT_URL: string;
	LANGGRAPH_GRAPH_ID: string;
}

const EnvContext = createContext<EnvContextType | undefined>(undefined);

interface EnvProviderProps {
	children: ReactNode;
	env: {
		MODE: string;
		LANGGRAPH_DEPLOYMENT_URL: string;
		LANGGRAPH_GRAPH_ID: string;
	};
}

export function EnvProvider({ children, env }: EnvProviderProps) {
	if (typeof window === "undefined") {
		return null;
	}
	env.LANGGRAPH_DEPLOYMENT_URL = `${window.location.origin}/api/ai`;
	return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
}

export function useEnv() {
	const context = useContext(EnvContext);
	if (context === undefined) {
		throw new Error("useEnv must be used within an EnvProvider");
	}
	return context;
}
