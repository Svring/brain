import type { Auth } from "@/contexts/auth/auth-machine";

/** Fields from Sealos session passed through every LangGraph run input. */
export function langgraphAuthFields(auth: Auth | null | undefined) {
	return {
		region_url: auth?.regionUrl,
		kubeconfig: auth?.kubeconfig,
		plan_name: auth?.planName,
		expire_at: auth?.expireAt,
	};
}
