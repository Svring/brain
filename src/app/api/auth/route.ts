import type { NextRequest } from "next/server";
import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
	getCurrentNamespace,
	getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-api/k8s-api-utils";
import { getResourceQuota } from "@/lib/sealos/resources/resource-quota/resource-quota-api/resource-quota-api-service";

export async function POST(req: NextRequest) {
	const kubeconfigEncoded = req.headers.get("authorization");

	if (!kubeconfigEncoded) {
		return Response.json({ error: "Unauthorized Kubeconfig" }, { status: 401 });
	}

	try {
		const kubeconfig = decodeURIComponent(kubeconfigEncoded);

		const [namespace, regionUrl] = await Promise.all([
			getCurrentNamespace(kubeconfig),
			getRegionUrlFromKubeconfig(kubeconfig),
		]);

		if (!namespace || !regionUrl) {
			return Response.json(
				{ error: "Failed to extract namespace or region URL from kubeconfig" },
				{ status: 400 },
			);
		}

		const k8sContext: K8sApiContext = {
			kubeconfig,
			namespace,
			regionUrl,
		};

		// Validate resource quota - if this succeeds, the quota is valid
		await getResourceQuota(k8sContext);

		return Response.json(
			{
				owner: namespace,
			},
			{ status: 200 },
		);
	} catch (error) {
		// If resource quota check fails, return 401
		return Response.json(
			{ error: error instanceof Error ? error.message : "Unauthorized" },
			{ status: 401 },
		);
	}
}
