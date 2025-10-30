"use client";

import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { useEnv } from "@/components/provider/env-provider";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuthState } from "@/contexts/auth/auth-context";
import {
	LanggraphProvider,
	useLanggraphActions,
	useLanggraphState,
} from "@/contexts/langgraph/langgraph-context";
import { useAiProxyContext } from "@/lib/auth/auth-utils";
import { useCreateAiProxyTokenMutation } from "@/lib/sealos/resources/ai-proxy/ai-proxy-method/ai-proxy-mutation";
import { listAiProxyTokensOptions } from "@/lib/sealos/resources/ai-proxy/ai-proxy-method/ai-proxy-query";
import { StreamProvider } from "./stream-provider";
import { ThreadProvider } from "./thread-provider";

// Normal config component for production/development
function LanggraphConfigInner({ children }: { children: ReactNode }) {
	const { auth } = useAuthState();
	const env = useEnv();
	const aiProxyContext = useAiProxyContext();
	const { isLoading, isLoaded } = useLanggraphState();
	const { setConfig, setConfigFailed } = useLanggraphActions();

	const isProduction = env.MODE === "production";

	// Query AI proxy tokens in production - only when not loaded
	const { data: aiProxyTokens, isLoading: tokensLoading } = useQuery({
		...listAiProxyTokensOptions(aiProxyContext),
		enabled: isProduction && !isLoaded,
	});

	const brainToken = aiProxyTokens?.tokens?.find(
		(token) => token.name === "brain",
	);
	const createTokenMutation = useCreateAiProxyTokenMutation(aiProxyContext);

	// Handle initial config loading
	useEffect(() => {
		if (isLoading) {
			const config = isProduction
				? {
						apiKey: brainToken ? `sk-${brainToken.key}` : undefined,
						baseUrl: `http://aiproxy.${aiProxyContext.baseUrl}/v1`,
						modelName: "gpt-4.1",
					}
				: {
						apiKey: auth?.apiKey,
						baseUrl: aiProxyContext.baseUrl
							? `http://aiproxy.${aiProxyContext.baseUrl}/v1`
							: auth?.baseUrl,
						modelName: "gpt-4.1",
					};

			// Check if config is complete
			if (config.apiKey && config.baseUrl && config.modelName) {
				setConfig({
					base_url: config.baseUrl,
					api_key: config.apiKey,
					model_name: config.modelName,
				});
			} else if (isProduction && !tokensLoading) {
				// No brain token found in production - automatically create one
				if (!brainToken) {
					createTokenMutation.mutateAsync(
						{ name: "brain" },
						{
							onSuccess: () => {
								window.location.reload();
							},
							onError: () => {
								// If automatic creation fails, show error and reload
								window.location.reload();
							},
						},
					);
				} else {
					setConfigFailed();
				}
			}
		}
	}, [
		isLoading,
		isProduction,
		brainToken,
		setConfig,
		setConfigFailed,
		createTokenMutation.mutateAsync,
		aiProxyContext.baseUrl,
		auth?.apiKey,
		auth?.baseUrl,
		tokensLoading,
	]);

	// Show loading state
	if (
		isLoading ||
		(isProduction && tokensLoading) ||
		(isProduction && !brainToken && createTokenMutation.isPending)
	) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen space-y-4">
				<LoadingScreen
					text={
						createTokenMutation.isPending
							? "Creating token..."
							: "Checking token configuration..."
					}
				/>
			</div>
		);
	}

	// Render children when loaded with nested providers
	return (
		<ThreadProvider>
			<StreamProvider>{children}</StreamProvider>
		</ThreadProvider>
	);
}

// Trial config component with dummy config
function LanggraphTrialConfigInner({ children }: { children: ReactNode }) {
	const { isLoading } = useLanggraphState();
	const { setConfig } = useLanggraphActions();

	// Set dummy config in trial mode
	useEffect(() => {
		if (isLoading) {
			setConfig({
				base_url: "https://trial-api.sealos.io/v1",
				api_key: "trial-api-key",
				model_name: "gpt-4-trial",
			});
		}
	}, [isLoading, setConfig]);

	return (
		<ThreadProvider>
			<StreamProvider>{children}</StreamProvider>
		</ThreadProvider>
	);
}

export const LanggraphConfig = ({ children }: { children: ReactNode }) => {
	return (
		<LanggraphProvider config={{}}>
			<LanggraphConfigInner>{children}</LanggraphConfigInner>
		</LanggraphProvider>
	);
};

export const LanggraphTrialConfig = ({ children }: { children: ReactNode }) => {
	return (
		<LanggraphProvider config={{}}>
			<LanggraphTrialConfigInner>{children}</LanggraphTrialConfigInner>
		</LanggraphProvider>
	);
};
