"use client";

import { createContext, useContext, ReactNode } from "react";

interface EnvContextType {
  MODE: string;
  LANGSMITH_API_KEY: string;
  LANGGRAPH_DEPLOYMENT_URL: string;
}

const EnvContext = createContext<EnvContextType | undefined>(undefined);

interface EnvProviderProps {
  children: ReactNode;
  env: {
    MODE: string;
    LANGSMITH_API_KEY: string;
    LANGGRAPH_DEPLOYMENT_URL: string;
  };
}

export function EnvProvider({ children, env }: EnvProviderProps) {
  return (
    <EnvContext.Provider value={env}>
      {children}
    </EnvContext.Provider>
  );
}

export function useEnv() {
  const context = useContext(EnvContext);
  if (context === undefined) {
    throw new Error("useEnv must be used within an EnvProvider");
  }
  return context;
}
