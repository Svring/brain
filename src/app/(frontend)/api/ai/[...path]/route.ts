import { proxy } from "hono/proxy";

const langgraphApiUrl = process.env.LANGGRAPH_DEPLOYMENT_URL;

if (!langgraphApiUrl) {
	throw new Error("LANGGRAPH_API_URL is required");
}

const handler = async (req: Request) => {
	const url = new URL(req.url);
	// Remove '/api/ai' prefix from pathname, default to '/' if pathname is exactly '/api/ai'
	const path = url.pathname.replace(/^\/api\/ai/, "") || "/";
	const targetUrl = `${langgraphApiUrl}${path}${url.search}`;

	return proxy(targetUrl, req);
};

export {
	handler as GET,
	handler as POST,
	handler as PUT,
	handler as DELETE,
	handler as PATCH,
};
