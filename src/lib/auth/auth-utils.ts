import { createSealosApp, sealosApp } from "@zjy365/sealos-desktop-sdk/app";
import { setCookie } from "nookies";
import { useAuthState } from "@/contexts/auth/auth-context";
import type { Auth } from "@/contexts/auth/auth-machine";
import {
	getCurrentNamespace,
	getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-api/k8s-api-utils";
import { AiProxyApiContextSchema } from "@/lib/sealos/resources/ai-proxy/schemas/ai-proxy-api-context";
import { ClusterApiContextSchema } from "@/lib/sealos/resources/cluster/schemas/cluster-api-context-schemas";
import { DeployApiContextSchema } from "@/lib/sealos/resources/deployment/schemas/deploy-api-context-schemas";
import { DevboxApiContextSchema } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas";
import { TemplateApiContextSchema } from "@/lib/sealos/resources/template/schemas/template-api-context-schemas";
import { SealosApiContextSchema } from "@/lib/sealos/sealos-api-context-schema";
import type { User } from "@/payload-types";
import {
	type K8sApiContext,
	K8sApiContextSchema,
} from "../k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { ObjectStorageApiContextSchema } from "../sealos/resources/objectstorage/schemas/objectstorage-api-context-schemas";
import {
	CLUSTER_METRICS_TEST_URL,
	CLUSTER_METRICS_URL,
	LAUNCHPAD_METRICS_TEST_URL,
	LAUNCHPAD_METRICS_URL,
} from "../sealos/services/metrics";
import { MetricsApiContextSchema } from "../sealos/services/metrics/schemas/metrics-api-context-schema";
import { TrafficApiContextSchema } from "../sealos/services/traffic/schemas/traffic-api-context-schema";
import {
	TRAFFIC_TEST_URL,
	TRAFFIC_URL,
} from "../sealos/services/traffic/traffic-constant/traffic-constant-url";

export async function extractAuthFromSession(
	session: any,
): Promise<Auth | null> {
	// Validate session properties
	if (!session?.kubeconfig) {
		// 暂时只检查 kubeconfig，不检查 token
		return null;
	}
	// Fetch namespace and regionUrl concurrently
	const [namespace, regionUrl] = await Promise.all([
		getCurrentNamespace(session.kubeconfig),
		getRegionUrlFromKubeconfig(session.kubeconfig),
	]);

	// Check if both values are valid strings
	if (typeof namespace !== "string" || typeof regionUrl !== "string") {
		return null;
	}

	return {
		namespace,
		kubeconfig: encodeURIComponent(session.kubeconfig),
		regionUrl,
		appToken: session.token, // 使用动态获取的token
	};
}

export function authenticateDev(payloadUser: User, send: (event: any) => void) {
	if (!payloadUser) {
		send({ type: "FAIL", error: "No User available" });
		return;
	}
	const auth: Auth = { ...payloadUser };
	send({ type: "SET_AUTH", auth });
}

export async function authenticateProd(send: (event: any) => void) {
	try {
		createSealosApp();
		const sessionData = await sealosApp.getSession();

		if (!sessionData) {
			send({ type: "FAIL", error: "No session data available" });
			return;
		}
		const authFromSession = await extractAuthFromSession(sessionData);
		if (!authFromSession) {
			send({ type: "FAIL", error: "Failed to extract auth from session" });
			return;
		}

		send({ type: "SET_AUTH", auth: authFromSession });
	} catch (error) {
		send({
			type: "FAIL",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

export function createK8sContext(): K8sApiContext {
	const auth = useAuthState();
	const kubeconfig = auth.auth?.kubeconfig;
	const namespace = auth.auth?.namespace;
	const regionUrl = auth.auth?.regionUrl;

	const k8sContext = K8sApiContextSchema.parse({
		namespace,
		kubeconfig: kubeconfig ? getDecodedKubeconfig(kubeconfig) : undefined,
		regionUrl,
	});
	setCookie(null, "kubeconfig", k8sContext.kubeconfig);
	setCookie(null, "namespace", k8sContext.namespace);
	setCookie(null, "regionUrl", k8sContext.regionUrl);
	return k8sContext;
}
export function useUserKubeconfig(): string | undefined {
	const { auth } = useAuthState();
	return auth?.kubeconfig;
}
export function getDecodedKubeconfig(kubeconfig?: string): string | undefined {
	if (!kubeconfig) {
		throw new Error("Kubeconfig not available");
	}
	return decodeURIComponent(kubeconfig);
}
export function useCurrentNamespace(): string | undefined {
	const { auth } = useAuthState();
	return auth?.namespace;
}
export function useCurrentRegionUrl(): string | undefined {
	const { auth } = useAuthState();
	return auth?.regionUrl;
}

export function useClusterContext() {
	const { auth } = useAuthState();
	if (!auth) {
		throw new Error("User not found");
	}
	const clusterContext = ClusterApiContextSchema.parse({
		baseUrl: auth?.regionUrl,
		authorization: auth?.kubeconfig,
	});
	return clusterContext;
}

export function useSealosContext() {
	const { auth } = useAuthState();
	if (!auth) {
		throw new Error("User not found");
	}
	const sealosContext = SealosApiContextSchema.parse({
		baseUrl: auth.regionUrl,
		authorization: auth.kubeconfig,
	});
	return sealosContext;
}

export function useObjectStorageContext() {
	const { auth } = useAuthState();
	if (!auth) {
		throw new Error("User not found");
	}
	const objectStorageContext = ObjectStorageApiContextSchema.parse({
		baseURL: auth.regionUrl,
		authorization: auth.kubeconfig,
		authorizationBearer: auth.appToken,
	});
	setCookie(null, "appToken", auth.appToken);
	return objectStorageContext;
}

export function useDevboxContext() {
	const { auth } = useAuthState();
	if (!auth) {
		throw new Error("User not found");
	}
	const devboxContext = DevboxApiContextSchema.parse({
		baseUrl: auth.regionUrl,
		authorization: auth.kubeconfig,
		authorizationBearer: auth.appToken,
	});
	setCookie(null, "appToken", auth.appToken);
	return devboxContext;
}

export function useDeployContext() {
	const { auth } = useAuthState();
	if (!auth) {
		throw new Error("User not found");
	}
	const deployContext = DeployApiContextSchema.parse({
		baseUrl: auth.regionUrl,
		authorization: auth.kubeconfig,
	});
	return deployContext;
}

export function useAiProxyContext() {
	const { auth } = useAuthState();
	if (!auth) {
		throw new Error("User not found");
	}
	const aiProxyContext = AiProxyApiContextSchema.parse({
		baseUrl: auth.regionUrl,
		authorization: auth.appToken,
	});
	setCookie(null, "appToken", auth.appToken);
	return aiProxyContext;
}

export function useTemplateApiContext() {
	const { auth } = useAuthState();
	if (!auth) {
		throw new Error("User not found");
	}
	return TemplateApiContextSchema.parse({
		baseUrl: auth.regionUrl,
		authorization: auth.kubeconfig,
	});
}

export function useTrafficApiContext() {
	const { auth } = useAuthState();
	const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";

	if (!auth) {
		throw new Error("Auth context is not available");
	}

	return TrafficApiContextSchema.parse({
		baseURL: isDevelopment ? TRAFFIC_TEST_URL : TRAFFIC_URL,
		kubeconfig: auth.kubeconfig,
	});
}

export function useMetricsContext(
	metricsType: "launchpad" | "cluster" = "launchpad",
) {
	const { auth } = useAuthState();
	const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";

	if (!auth) {
		throw new Error("User not found");
	}

	const baseUrl =
		metricsType === "launchpad"
			? isDevelopment
				? LAUNCHPAD_METRICS_TEST_URL
				: LAUNCHPAD_METRICS_URL
			: isDevelopment
				? CLUSTER_METRICS_TEST_URL
				: CLUSTER_METRICS_URL;

	return MetricsApiContextSchema.parse({
		baseUrl,
		kubeconfig: encodeURIComponent(auth.kubeconfig),
		namespace: auth.namespace,
	});
}

export function useCostCenterContext() {
	const { auth } = useAuthState();
	if (!auth) {
		throw new Error("User not found");
	}

	// Extract region domain from regionUrl
	const regionDomain = auth.regionUrl
		.replace(/^https?:\/\//, "")
		.replace(/:\d+$/, "");

	return {
		baseUrl: auth.regionUrl,
		authorization: auth.appToken,
		workspace: auth.namespace,
		regionDomain: regionDomain,
		internalToken: auth.appToken,
	};
}

export const openCostCenterApp = () => {
	createSealosApp();
	sealosApp.runEvents("openDesktopApp", {
		appKey: "system-costcenter",
		pathname: "/",
		query: {
			mode: "upgrade",
		},
		messageData: {
			type: "InternalAppCall",
			mode: "upgrade",
		},
	});
};

export const requestLogin = ({
	pathname,
	query,
}: {
	pathname: string;
	query: string;
}) => {
	createSealosApp();
	sealosApp.runEvents("request_login", {
		appName: "system-brain",
		pathname: pathname,
		query: query,
	});
};

export function activateContextCookies() {
	createK8sContext();
	useAiProxyContext();
	useMetricsContext("launchpad");
	useMetricsContext("cluster");
}
