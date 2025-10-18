"use client";

import { useLocalStorage } from "@reactuses/core";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { useEnv } from "@/components/provider/env-provider";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Spinner } from "@/components/ui/spinner";
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

// Inner component that uses langgraph state and actions
function LanggraphConfigInner({ 
	children, 
	trial = false 
}: { 
	children: ReactNode;
	trial?: boolean;
}) {
	const { auth } = useAuthState();
	const env = useEnv();
	const aiProxyContext = useAiProxyContext();
	const { isLoading, isLoaded, isUnloaded, modelName } = useLanggraphState();
	const { setConfig, setConfigFailed } = useLanggraphActions();

	// console.log("modelName", modelName);

	const isProduction = env.MODE === "production";

	// Track if user has previously clicked the Create button
	const [hasClickedCreate, setHasClickedCreate] = useLocalStorage(
		"sealos-brain-create-clicked",
		false,
	);

	// Query AI proxy tokens in production - only when not loaded
	const { data: aiProxyTokens, isLoading: tokensLoading } = useQuery({
		...listAiProxyTokensOptions(aiProxyContext),
		enabled: isProduction && !isLoaded,
	});

	// console.log("aiProxyTokens", aiProxyTokens);

	const brainToken = aiProxyTokens?.tokens?.find(
		(token) => token.name === "brain",
	);
	const createTokenMutation = useCreateAiProxyTokenMutation(aiProxyContext);

	// Handle initial config loading
	useEffect(() => {
		if (isLoading) {
			// Check if environment variables are available first
			if (env.AGENT_API_KEY && env.AGENT_BASE_URL && env.AGENT_MODEL_NAME) {
				// Use environment variables as first priority
				// console.log("env", env);
				setConfig({
					base_url: env.AGENT_BASE_URL,
					api_key: env.AGENT_API_KEY,
					model_name: env.AGENT_MODEL_NAME,
				});
			} else {
				// Fall back to current logic if env vars are not complete
				const config = isProduction
					? {
							apiKey: brainToken ? `sk-${brainToken.key}` : undefined,
							baseUrl: `http://aiproxy.${aiProxyContext.baseUrl}/v1`,
							modelName:
								aiProxyContext.baseUrl?.endsWith("io") &&
								!aiProxyContext.baseUrl?.endsWith("nip.io")
									? "gpt-4.1"
									: "kimi-k2-0711-preview",
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
					// No brain token found in production
					if (!brainToken) {
						// If user has previously clicked Create, automatically create token
						if (hasClickedCreate) {
							createTokenMutation.mutateAsync(
								{ name: "brain" },
								{
									onSuccess: () => {
										toast.success("Token created successfully.");
										window.location.reload();
									},
									onError: () => {
										// If automatic creation fails, show the manual UI
										setConfigFailed();
										window.location.reload();
									},
								},
							);
						} else {
							// Show UI for asking permission
							setConfigFailed();
						}
					} else {
						setConfigFailed();
					}
				}
			}
		}
	}, [
		isLoading,
		isProduction,
		brainToken,
		env.AGENT_API_KEY,
		env.AGENT_BASE_URL,
		env.AGENT_MODEL_NAME,
		setConfig,
		setConfigFailed,
		hasClickedCreate,
		createTokenMutation.mutateAsync,
		aiProxyContext.baseUrl,
		auth?.apiKey,
		auth?.baseUrl,
		tokensLoading,
	]);

	// Handle trial mode - set dummy config and return children directly
	useEffect(() => {
		if (trial && isLoading) {
			setConfig({
				base_url: "https://trial-api.sealos.io/v1",
				api_key: "trial-api-key",
				model_name: "gpt-4-trial",
			});
		}
	}, [trial, isLoading, setConfig]);

	// If trial mode, return children directly
	if (trial) {
		return (
			<ThreadProvider>
				<StreamProvider>{children}</StreamProvider>
			</ThreadProvider>
		);
	}

	// Handle token creation
	const handleCreateToken = () => {
		// Store that user has clicked the Create button
		setHasClickedCreate(true);

		createTokenMutation.mutateAsync(
			{ name: "brain" },
			{
				onSuccess: () => {
					toast.success("Token created successfully.");
					window.location.reload();
				},
				onError: () => {
					toast.error(
						"Please complete real-name authentication before proceeding.",
					);
				},
			},
		);
	};

	// Show loading state
	if (
		isLoading ||
		(isProduction && tokensLoading) ||
		(isProduction && !brainToken && createTokenMutation.isPending) ||
		(isProduction &&
			!brainToken &&
			hasClickedCreate &&
			createTokenMutation.isPending)
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

	// Show token creation UI if unloaded (no token found)
	if (isUnloaded) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen space-y-4">
				<div className="flex flex-col items-center space-y-4">
					<img
						src="/sealos-brain-icon-grayscale.svg"
						alt="Sealos Brain"
						width={64}
						height={64}
						className="mb-2 rounded-2xl"
					/>
					<div className="text-muted-foreground text-center space-y-2">
						<p>Sealos Brain requires an API KEY to function.</p>
						<p>Please click the button below to create one in AI Proxy.</p>
					</div>
				</div>
				<Button
					onClick={handleCreateToken}
					disabled={createTokenMutation.isPending}
					className="min-w-40"
					size="sm"
				>
					{createTokenMutation.isPending ? (
						<>
							<Spinner className="mr-2 h-4 w-4" />
							Processing...
						</>
					) : (
						"Create"
					)}
				</Button>
				<p className="text-muted-foreground text-center text-sm">
					Proceeding means you accept{" "}
					<a
						href="https://sealos.io/terms"
						target="_blank"
						rel="noopener noreferrer"
						className="underline"
					>
						Our Terms of Service
					</a>
					.
				</p>
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

export const LanggraphConfigWrapper = ({
	children,
	trial = false,
}: {
	children: ReactNode;
	trial?: boolean;
}) => {
	return (
		<LanggraphProvider config={{}}>
			<LanggraphConfigInner trial={trial}>{children}</LanggraphConfigInner>
		</LanggraphProvider>
	);
};
