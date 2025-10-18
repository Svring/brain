"use client";

import { createContext, use, useCallback } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { EnvContext, envMachine } from "./env.state";

interface EnvContextValue {
	env: EnvContext;
	state: StateFrom<typeof envMachine>;
	send: (event: EventFrom<typeof envMachine>) => void;
}

export const envMachineContext = createContext<EnvContextValue | undefined>(
	undefined,
);

export function useEnvContext() {
	const ctx = use(envMachineContext);
	if (!ctx) {
		throw new Error("useEnvContext must be used within EnvAdapter");
	}
	return ctx;
}

export function useEnvState() {
	const { state } = useEnvContext();

	// Ensure env is ready, throw error if not
	if (state.matches("initializing")) {
		throw new Error("Environment is still initializing");
	}

	if (state.matches("failed")) {
		throw new Error("Environment initialization failed");
	}

	if (!state.context) {
		throw new Error("No environment configuration available");
	}

	// Directly expose the data fields
	return {
		mode: state.context.mode,
		variables: state.context.variables,
		isInitializing: state.matches("initializing"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useEnvEvents() {
	const { send } = useEnvContext();

	return {
		setEnv: useCallback((
			mode: "development" | "production",
			variables: Record<string, string | undefined>,
		) => send({ type: "SET_ENV", mode, variables }), [send]),
		fail: useCallback(() => send({ type: "FAIL" }), [send]),
		retry: useCallback(() => send({ type: "RETRY" }), [send]),
	};
}
